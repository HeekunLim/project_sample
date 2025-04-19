import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'No access token provided' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  const { videoIds, title } = await req.json()

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: token })

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  try {
    const playlistRes = await youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: `메모 : ${title}\n*Plug를 통해 생성된 재생목록입니다.`,
        },
        status: {
          privacyStatus: 'unlisted',
        },
      },
    })

    const playlistId = playlistRes.data.id

    for (const videoId of videoIds) {
      await youtube.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId: playlistId!,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
          },
        },
      })
    }

    return NextResponse.json({ message: '재생목록 생성 완료', playlistId })
  } catch (error: any) {
    console.error(JSON.stringify(error, null, 2))
    return NextResponse.json({ error: '재생목록 생성 실패', details: error.message }, { status: 500 })
  }
}
