import QRCode from "qrcode";
import sharp from "sharp";

export async function generateQrWithLogo(url) {
    const qrWidth = 250;
    const logoHeight = 60;
    const padding = 20;
    const totalHeight = qrWidth + logoHeight + padding; // 250 + 60 + 20 = 330

    const qrBuffer = await QRCode.toBuffer(url, {
        errorCorrectionLevel: "M", // Can use 'M' now since logo doesn't block data!
        width: qrWidth,
        margin: 2,
    });

    const logo = await sharp("./assets/academia-logo.png")
        .resize({ height: logoHeight }) // Scales width proportionally
        .png()
        .toBuffer();

    const logoMetadata = await sharp(logo).metadata();
    const logoLeft = Math.floor((qrWidth - logoMetadata.width) / 2);

    const finalImage = await sharp({
        create: {
            width: qrWidth,
            height: totalHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    })
    .composite([
        {
            input: qrBuffer,
            top: 0,
            left: 0,
        },
        {
            input: logo,
            top: qrWidth,
            left: logoLeft,
        }
    ])
    .png()
    .toBuffer();

    return `data:image/png;base64,${finalImage.toString("base64")}`;
}