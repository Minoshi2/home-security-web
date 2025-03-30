"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, History } from "lucide-react"
import { BACKEND_BASE_URL } from "@/constants"
import Link from "next/link"

export default function HistoryPage() {
    const [detectionHistory, setDetectionHistory] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [apiConnected, setApiConnected] = useState(false)

    // Check API connection on component mount
    useEffect(() => {
        const checkApiConnection = async () => {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

                const response = await fetch(`${BACKEND_BASE_URL}/`, {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        Accept: "application/json",
                    },
                    signal: controller.signal,
                }).finally(() => clearTimeout(timeoutId))

                if (response.ok) {
                    setApiConnected(true)
                    console.log("Successfully connected to the API")
                } else {
                    throw new Error(`Server responded with status: ${response.status}`)
                }
            } catch (error) {
                console.error("API connection check failed:", error)
                setApiConnected(false)
            }
        }

        checkApiConnection()
    }, [])

    // Fetch history data when the component mounts
    useEffect(() => {
        if (apiConnected) {
            fetchHistory()
        } else {
            setIsLoading(false)
        }
    }, [apiConnected])

    const fetchHistory = async () => {
        setIsLoading(true)
        try {
            if (apiConnected) {
                const response = await fetch(`${BACKEND_BASE_URL}/get_history`, {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        Accept: "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`)
                }

                const data = await response.json()
                setDetectionHistory(data)
            }
        } catch (error) {
            console.error("Failed to fetch history:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Helper function to render Yes/No with appropriate styling
    const renderBooleanValue = (value: boolean) => (
        <span className={value ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>
      {value ? "Yes" : "No"}
    </span>
    )

    return (
        <div className="container p-4 max-w-7xl flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="outline" size="icon" className="mr-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Dashboard</span>
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Detection History
                        </h1>
                        <p className="text-muted-foreground">View all detection events</p>
                    </div>
                </div>
                <Button onClick={fetchHistory} disabled={isLoading || !apiConnected}>
                    {isLoading ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {!apiConnected && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">
                    API connection error. Unable to fetch history data.
                </div>
            )}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Detection Events</CardTitle>
                    <CardDescription>Complete record of all detection events from the security system</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : detectionHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="py-3 px-4 text-left font-medium text-sm">Source ID</th>
                                    <th className="py-3 px-4 text-left font-medium text-sm">Message</th>
                                    <th className="py-3 px-4 text-center font-medium text-sm">Person</th>
                                    <th className="py-3 px-4 text-center font-medium text-sm">Knife</th>
                                    <th className="py-3 px-4 text-center font-medium text-sm">Gun</th>
                                    <th className="py-3 px-4 text-center font-medium text-sm">Multiple Persons</th>
                                    <th className="py-3 px-4 text-right font-medium text-sm">Timestamp</th>
                                </tr>
                                </thead>
                                <tbody>
                                {detectionHistory.map((obj: any, index: number) => {
                                    const formattedTimestamp = new Date(obj.timestamp).toLocaleTimeString()

                                    return (
                                        <tr
                                            key={obj.timestamp + index}
                                            className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/30" : ""}
                                        >
                                            <td className="py-3 px-4 text-sm border-b dark:border-gray-800">{obj.sourceId}</td>
                                            <td className="py-3 px-4 text-sm max-w-[200px] truncate border-b dark:border-gray-800">
                                                {obj.message}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-center border-b dark:border-gray-800">
                                                {renderBooleanValue(obj.person)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-center border-b dark:border-gray-800">
                                                {renderBooleanValue(obj.knife)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-center border-b dark:border-gray-800">
                                                {renderBooleanValue(obj.gun)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-center border-b dark:border-gray-800">
                                                {renderBooleanValue(obj.multiplePersons)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-muted-foreground border-b dark:border-gray-800">
                                                {formattedTimestamp}
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No detection history available</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

