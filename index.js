#!/usr/bin/env node

const minimist = require('minimist');
const puppeteer = require('puppeteer');

const args = minimist(process.argv.slice(2));

if (args.help || args.h) {
    console.log('Usage: fast-cli [options]');
    console.log('Options:');
    console.log('-u, --upload          Show download and upload speed');
    console.log('-h, --headless        Turns on headless mode')
    console.log('-t, --time <seconds>  Duration of speed test in seconds');
    console.log('-h, --help            Display help information');
} else {
    let time = args.time || args.t || 10;
    const showUpload = args.upload || args.u || false;
    const headless = args.headless || args.h || true;
    let hMode = false;

    if (headless) {
        hMode = true;
    }

    if (showUpload) {
        time = 20
    }

    (async () => {
        const browser = await puppeteer.launch({
            executablePath: '/Users/adityamitra/Documents/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
            headless: hMode,
        });

        const page = await browser.newPage();
        await page.goto('https://fast.com');

        let elapsedTime = 0;
        let downloadSpeed = 0;
        let speedType = 'Mbps';
        let uploadSpeed = 0;
        let loadingSign = '|';
        while (elapsedTime < time) {
            const downloadElement = await page.$('#speed-value');
            const speedTypeElement = await page.$('#speed-units');
            downloadSpeed = await page.evaluate(downloadElement => downloadElement.textContent, downloadElement);
            speedType = await page.evaluate(speedTypeElement => speedTypeElement.textContent, speedTypeElement);
            if (showUpload) {
                const uploadElement = await page.$('#upload-value');
                uploadSpeed = await page.evaluate(uploadElement => uploadElement.textContent, uploadElement);
                process.stdout.write(`\r ${downloadSpeed.trim()} ${speedType.trim()} ↓ | ${uploadSpeed.trim()} ${speedType.trim()} ↑ ${loadingSign}`);
            } else {
                process.stdout.write(`\r ${downloadSpeed.trim()} ${speedType.trim()} ↓ ${loadingSign}`);
            }
            loadingSign = loadingSign === '|' ? '/' : loadingSign === '/' ? '-' : loadingSign === '-' ? '\\' : '|';
            await page.waitForTimeout(500);
            elapsedTime += 0.5;
        }

        process.stdout.write('\r');
        process.stdout.clearLine(1);
        console.log(`Download speed: ${downloadSpeed.trim()} Mbps`);
        if (showUpload) {
            console.log(`Upload speed: ${uploadSpeed.trim()} Mbps`);
        }
        console.log('Speed test complete!');

        await browser.close();
    })();
}