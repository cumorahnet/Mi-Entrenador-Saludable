package com.mientrenadorsaludable.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class GpsDistanceFilterTest {
    @Test public void accumulatesSlowWalking() {
        GpsDistanceFilter filter = new GpsDistanceFilter();
        double total = 0;
        for (int second = 1; second <= 60; second++)
            total += Math.max(0, filter.accept(second / 111111.0, 0, 10, second * 1000L, second * 1000L));
        assertTrue(total > 54 && total < 61);
    }
    @Test public void rejectsJumpsStaleAndInaccurateFixes() {
        GpsDistanceFilter filter = new GpsDistanceFilter();
        assertEquals(0, filter.accept(0, 0, 10, 1000, 1000), 0);
        assertEquals(-1, filter.accept(1, 0, 10, 2000, 2000), 0);
        assertEquals(-1, filter.accept(0, 0, 100, 2000, 2000), 0);
        assertEquals(-1, filter.accept(0, 0, 10, 2000, 30000), 0);
        assertEquals(-1, filter.accept(0, 0, 10, 500, 1000), 0);
        assertEquals(0, filter.accept(1, 0, 10, 60000, 60000), 0);
    }
    @Test public void stationaryFixesDoNotAddDistance() {
        GpsDistanceFilter filter = new GpsDistanceFilter();
        for (int second = 1; second < 120; second++)
            assertEquals(0, filter.accept(20, -100, 10, second * 1000L, second * 1000L), 0);
    }
}
