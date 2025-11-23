import { useState } from 'react'
import { Loader2, Download, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

function App() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!url) return

        setLoading(true)
        setError(null)
        setData(null)

        try {
            const apiUrl = import.meta.env.PROD
                ? '/api/video-info'
                : 'http://localhost:3001/api/video-info';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            })

            const result = await response.json()

            if (result.error) {
                setError(result.error)
            } else {
                setData(result)
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 tracking-tight">
                        Universal Downloader
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Download videos from YouTube, Facebook, Instagram, Twitter, and more.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-white transition-all"
                                placeholder="Paste video URL here..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !url}
                            className={clsx(
                                "px-8 py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg",
                                loading || !url
                                    ? "bg-gray-700 cursor-not-allowed opacity-50"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Get Video"
                            )}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                )}

                {data && (
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/3 aspect-video bg-black rounded-lg overflow-hidden relative group">
                                <img
                                    src={data.thumbnail}
                                    alt={data.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
                                        <CheckCircle className="h-8 w-8 text-green-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <h2 className="text-xl font-bold line-clamp-2">{data.title}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>{data.duration}</span>
                                    <span>•</span>
                                    <span>{data.uploader}</span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-300">Download Options</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {data.formats.map((format, i) => (
                                            <a
                                                key={i}
                                                href={format.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors group"
                                                download
                                            >
                                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                                                    {format.quality} ({format.ext})
                                                </span>
                                                <Download className="h-4 w-4 text-gray-500 group-hover:text-blue-400" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
