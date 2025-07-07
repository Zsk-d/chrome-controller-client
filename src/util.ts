export const randomFloat = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}