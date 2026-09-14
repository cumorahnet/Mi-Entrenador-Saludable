(function exposeExerciseCatalog(root, factory) {
    const catalog = factory();

    if (typeof module === 'object' && module.exports) module.exports = catalog;
    if (root) root.ExerciseCatalog = catalog;
}(globalThis, function createExerciseCatalog() {
    return [
        { group:'PIERNAS', difficulty:'Fácil', name:'Sentadilla clásica', description:'Pies al ancho de hombros, baja la cadera como si te sentaras en una silla.' },
        { group:'PIERNAS', difficulty:'Fácil', name:'Zancada estática alterna', description:'Da un paso largo hacia adelante y flexiona ambas rodillas a 90°, alterna piernas.' },
        { group:'PIERNAS', difficulty:'Fácil', name:'Puente de glúteos', description:'Tumbado boca arriba, rodillas dobladas, eleva la cadera apretando glúteos.' },
        { group:'PIERNAS', difficulty:'Fácil', name:'Sentadilla sumo', description:'Pies más abiertos que hombros y puntas hacia fuera, baja en sentadilla.' },
        { group:'PIERNAS', difficulty:'Fácil', name:'Elevación de talones (gemelos)', description:'De pie, súbete a las puntas de los pies y baja lentamente.' },
        { group:'PIERNAS', difficulty:'Intermedio', name:'Zancada lateral', description:'Da un paso ancho hacia un lado, flexiona esa pierna y mantén la otra estirada.' },
        { group:'PIERNAS', difficulty:'Intermedio', name:'Sentadilla con salto', description:'Haz una sentadilla y al subir salta explosivamente.' },
        { group:'PIERNAS', difficulty:'Intermedio', name:'Zancada caminando', description:'Da zancadas hacia adelante mientras avanzas por el espacio.' },
        { group:'PIERNAS', difficulty:'Intermedio', name:'Sentadilla búlgara estática', description:'Apoya el empeine de un pie en una silla detrás y haz sentadilla con la otra pierna.' },
        { group:'PIERNAS', difficulty:'Intermedio', name:'Zancada cruzada (curtsy lunge)', description:'Lleva una pierna por detrás y hacia el lado contrario, flexiona.' },
        { group:'PIERNAS', difficulty:'Difícil', name:'Sentadilla pistol con apoyo', description:'Sentadilla a una pierna, la otra extendida al frente, agárrate de algo para ayudar.' },
        { group:'PIERNAS', difficulty:'Difícil', name:'Zancada búlgara con pausa', description:'Como la búlgara, pero mantén 3 segundos abajo en cada repetición.' },
        { group:'PIERNAS', difficulty:'Difícil', name:'Sentadilla jump split', description:'En posición de zancada, salta y cambia la pierna adelante y atrás en el aire.' },
        { group:'PIERNAS', difficulty:'Difícil', name:'Pistol sin apoyo', description:'Sentadilla a una pierna sin agarrarte de nada, manteniendo el equilibrio.' },
        { group:'PIERNAS', difficulty:'Difícil', name:'Zancada lateral con salto', description:'Salta de lado a lado aterrizando en zancada lateral profunda.' },
        { group:'TRONCO', difficulty:'Fácil', name:'Plancha frontal de rodillas', description:'Apoyo en antebrazos y rodillas, mantén la espalda recta.' },
        { group:'TRONCO', difficulty:'Fácil', name:'Superman estático', description:'Tumbado boca abajo, levanta brazos y piernas del suelo a la vez.' },
        { group:'TRONCO', difficulty:'Fácil', name:'Crunch clásico', description:'Tumbado boca arriba, rodillas dobladas, eleva solo los hombros del suelo.' },
        { group:'TRONCO', difficulty:'Fácil', name:'Puente de glúteos (core)', description:'Eleva la cadera y mantén 5 segundos arriba para activar el centro.' },
        { group:'TRONCO', difficulty:'Fácil', name:'Perro-pájaro', description:'En cuatro apoyos, extiende brazo derecho y pierna izquierda; alterna.' },
        { group:'TRONCO', difficulty:'Intermedio', name:'Plancha frontal completa', description:'Apoyo en antebrazos y puntas de pies, cuerpo recto como una tabla.' },
        { group:'TRONCO', difficulty:'Intermedio', name:'Plancha lateral', description:'Apoyo en un antebrazo y el borde del pie, cuerpo recto de lado.' },
        { group:'TRONCO', difficulty:'Intermedio', name:'Escalador (mountain climber)', description:'En plancha alta, lleva las rodillas al pecho alternando rápido.' },
        { group:'TRONCO', difficulty:'Intermedio', name:'Crunch inverso', description:'Tumbado, lleva las rodillas al pecho y eleva la cadera del suelo.' },
        { group:'TRONCO', difficulty:'Intermedio', name:'Russian twist con pies en el suelo', description:'Sentado, gira el tronco de lado a lado con las manos juntas.' },
        { group:'TRONCO', difficulty:'Difícil', name:'Plancha con elevación de pierna', description:'En plancha frontal, eleva una pierna unos 20 cm y mantén.' },
        { group:'TRONCO', difficulty:'Difícil', name:'Plancha lateral con elevación de cadera', description:'En plancha lateral, baja y sube la cadera sin tocar el suelo.' },
        { group:'TRONCO', difficulty:'Difícil', name:'Russian twist con pies elevados', description:'Sentado con los pies en el aire, gira el tronco tocando el suelo a cada lado.' },
        { group:'TRONCO', difficulty:'Difícil', name:'Plancha frontal con toque de hombro', description:'En plancha alta, toca el hombro derecho con la mano izquierda; alterna.' },
        { group:'TRONCO', difficulty:'Difícil', name:'Dragon flag (progresión)', description:'Tumbado, agárrate detrás y eleva el cuerpo recto usando el abdomen.' },
        { group:'BRAZOS', difficulty:'Fácil', name:'Flexiones en pared', description:'Manos en la pared, inclina el cuerpo y haz flexiones verticales.' },
        { group:'BRAZOS', difficulty:'Fácil', name:'Flexiones de rodillas', description:'Apoyo en rodillas y manos, baja el pecho al suelo.' },
        { group:'BRAZOS', difficulty:'Fácil', name:'Fondos de tríceps en silla', description:'Manos detrás en una silla, baja el cuerpo con los pies en el suelo.' },
        { group:'BRAZOS', difficulty:'Fácil', name:'Flexiones inclinadas', description:'Manos apoyadas en una silla o mesa, pies en el suelo.' },
        { group:'BRAZOS', difficulty:'Fácil', name:'Isométrico de bíceps (contracción)', description:'Flexiona el brazo a 90° y aprieta el bíceps durante 30 segundos.' },
        { group:'BRAZOS', difficulty:'Intermedio', name:'Flexiones clásicas', description:'Manos al ancho de hombros, pies juntos, baja todo el cuerpo recto.' },
        { group:'BRAZOS', difficulty:'Intermedio', name:'Flexiones diamante', description:'Manos juntas formando un triángulo bajo el pecho para trabajar tríceps.' },
        { group:'BRAZOS', difficulty:'Intermedio', name:'Flexiones con apertura', description:'Baja el pecho y separa las manos del suelo durante la subida.' },
        { group:'BRAZOS', difficulty:'Intermedio', name:'Fondos de tríceps con pies elevados', description:'Haz fondos en silla con los pies apoyados en otra silla.' },
        { group:'BRAZOS', difficulty:'Intermedio', name:'Flexiones con agarre cerrado', description:'Manos justo debajo de los hombros y codos pegados al cuerpo.' },
        { group:'BRAZOS', difficulty:'Difícil', name:'Flexiones militares (pies elevados)', description:'Pies en una silla y manos en el suelo para cargar más brazos y hombros.' },
        { group:'BRAZOS', difficulty:'Difícil', name:'Flexiones con palmada', description:'Empuja con fuerza hacia arriba para dar una palmada en el aire.' },
        { group:'BRAZOS', difficulty:'Difícil', name:'Flexiones a una mano', description:'Apoyo en una sola mano, con la otra detrás de la espalda.' },
        { group:'BRAZOS', difficulty:'Difícil', name:'Flexiones en pica (hombros)', description:'Con la cadera elevada en V invertida, baja la cabeza hacia el suelo.' },
        { group:'BRAZOS', difficulty:'Difícil', name:'Flexiones de plancha lateral y brazo', description:'En plancha lateral, haz una flexión con el brazo de apoyo.' }
    ];
}));
