// Comprobar que se genere un ID único

export function generarId() {
    return `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
}