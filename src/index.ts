import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Qiitaのアクセストークン（環境変数から取得）
const qiitaToken: string = process.env.QIITA_ACCESS_TOKEN!;
// LINEのチャネルアクセストークン（環境変数から取得）
const lineToken: string = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
// LINEチャンネルのユーザーID（環境変数から取得）
const userId: string = process.env.LINE_CHANNEL_USER_ID!;

// Qiitaの記事の型定義
interface QiitaArticle {
    title: string;
    url: string;
}

// Qiitaの最新記事を取得する関数
async function fetchQiitaArticles(): Promise<QiitaArticle[]> {
    try {
        const response = await axios.get<QiitaArticle[]>('https://qiita.com/api/v2/items?page=1&per_page=5', {
            headers: {
                'Authorization': `Bearer ${qiitaToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Qiita articles:', error);
        return [];
    }
}

// LINEにメッセージを送信する関数
async function sendLineMessage(message: string): Promise<void> {
    try {
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,  // 送信先のユーザーID
            messages: [
                {
                    type: 'text',
                    text: message
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${lineToken}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error sending LINE message:', error);
    }
}

// メイン処理
(async () => {
    const articles = await fetchQiitaArticles();
    if (articles.length > 0) {
        const message = articles.map(article => `タイトル: ${article.title}\nURL: ${article.url}`).join('\n\n');
        await sendLineMessage(message);
    } else {
        console.log('No new articles found.');
    }
})();
