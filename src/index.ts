import App from './app';
import TransformApp from './transform';

async function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}

async function main() {
    const image = await loadImage("http://localhost:8080/leaves.jpg");
    // const app = new App(image);
    new TransformApp();
}

main();