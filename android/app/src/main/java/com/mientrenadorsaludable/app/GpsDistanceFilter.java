package com.mientrenadorsaludable.app;

/** Pure Java distance filter: rejected short increments do not move the anchor. */
final class GpsDistanceFilter {
    private double latitude, longitude, accuracy;
    private long timestamp;

    double accept(double lat, double lng, double acc, long time, long now) {
        if (!Double.isFinite(lat) || !Double.isFinite(lng) || !Double.isFinite(acc) ||
            Math.abs(lat) > 90 || Math.abs(lng) > 180 || acc < 0 || acc > 50 ||
            now - time > 15000 || time > now + 1000 || time <= timestamp) return -1;
        double meters = 0;
        if (timestamp > 0 && time - timestamp <= 30000) {
            double dLat = Math.toRadians(lat - latitude), dLng = Math.toRadians(lng - longitude);
            double h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(Math.toRadians(latitude)) *
                Math.cos(Math.toRadians(lat)) * Math.pow(Math.sin(dLng / 2), 2);
            meters = 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
            if (meters / ((time - timestamp) / 1000.0) > 12) return -1;
            if (meters < Math.max(2, Math.min(10, (accuracy + acc) * .15))) return 0;
        }
        latitude = lat; longitude = lng; accuracy = acc; timestamp = time;
        return meters;
    }
}
