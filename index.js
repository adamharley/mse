const { readFile, writeFile } = require('node:fs/promises')

;(async () => {
    const response = await fetch('https://www.moneysavingexpert.com/latesttip/')
    const html = await response.text()

    const description = html.match(/meta name="description" content=".+?incl... ?(.+?)"/)[1]
    const title = html.match(/meta name="title" content="Latest weekly email: (.+?)"/)[1]
    const img = html.match(/meta property="og:image" content="(.+?)"/)[1]
    const [, date, year, month, day] = html.match(/meta property="article:published_time" content="((\d{4})-(\d{2})-(\d{2}))"/)

    try {
        if (date == await readFile('./known', 'utf8')) {
            return
        }
    } catch {}

    await writeFile('./known', date)

    const payload = {
        embeds: [
            {
                title: title,
                description: description,
                url: `https://www.moneysavingexpert.com/tips/${year}/${month}/${day}`,
                thumbnail: {
                    url: img
                }
            }
        ]
    }
    const request = new Request(
        process.env.WEBHOOK_URL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    )
    await fetch(request)
})()