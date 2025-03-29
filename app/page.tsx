"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Scissors, User, Users } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

// Add the import for the StatusIndicator component and cn utility at the top of the file
import { cn } from "@/lib/utils"

// Update to the provided API URL
// Status Indicator component
import { StatusIndicator } from "@/components/status-indicator"
import { BACKEND_BASE_URL } from "@/constants";
import useDetectionWebSocket from "@/hooks/useDetectionWebSocket";

export default function VideoApp() {
    const [currentDateTime, setCurrentDateTime] = useState("")
    const [remainingTime, setRemainingTime] = useState("")
    const [videoSource, setVideoSource] = useState("prerecorded") // "webcam" or "prerecorded"
    const [isDetecting, setIsDetecting] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [textPaneMessage, setTextPaneMessage] = useState("")
    const [isLoading, setIsLoading] = useState({
        webcam: false,
        video: false,
        startDetection: false,
        stopDetection: false,
    })
    const [videoId, setVideoId] = useState("7") // Default video ID
    const imageRef = useRef(null)
    const [apiConnected, setApiConnected] = useState(false)
    const [videoError, setVideoError] = useState(false)
    const [isNlpEnabled, setIsNlpEnabled] = useState(false)
    const [imageDimensions, setImageDimensions] = useState({ width: 640, height: 360 })

    const { detections, nlpMessage, detectedObjects } = useDetectionWebSocket(apiConnected, isNlpEnabled)

    // Debug logging for API connection and video status
    useEffect(() => {
        console.log("API connected:", apiConnected)
        console.log("Video error:", videoError)
    }, [apiConnected, videoError])

    // Update date and time every second and calculate remaining time until 7 PM
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date()
            const formattedDate = now.toLocaleString()
            setCurrentDateTime(formattedDate)

            // Calculate remaining time for auto detection
            const targetHour = 19 // 7 PM
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()
            const currentSecond = now.getSeconds()

            let remainingTime = 0
            if (currentHour < targetHour || (currentHour === targetHour && currentMinute === 0)) {
                // Time until 7 PM
                remainingTime = ((targetHour - currentHour - 1) * 60 + (60 - currentMinute)) * 60 - currentSecond
            } else {
                // Time until 7 AM next day
                remainingTime = ((24 - currentHour + targetHour - 1) * 60 + (60 - currentMinute)) * 60 - currentSecond
            }

            const hoursLeft = Math.floor(remainingTime / 3600)
            const minutesLeft = Math.floor((remainingTime % 3600) / 60)
            const secondsLeft = remainingTime % 60

            setRemainingTime(
                `Auto Detection will start at 7 PM. Remaining time: ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`,
            )
        }

        updateDateTime()
        const interval = setInterval(updateDateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    // Check API connection on component mount
    useEffect(() => {
        const checkApiConnection = async () => {
            try {
                // Add a timeout to the fetch request
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

                // Try to fetch a simple endpoint to check connection
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
                    setVideoError(false)
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

    // API call helper function with error handling
    const callAPI = async (endpoint: string, loadingKey: keyof typeof isLoading, successMessage: string) => {
        setIsLoading((prev) => ({ ...prev, [loadingKey]: true }))

        try {
            // If API is not connected, show error
            if (!apiConnected) {
                console.error("API Error: API is not connected. Please try again later.")
                return { success: false, message: "API not connected" }
            }

            const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`)
            }

            const data = await response.json()
            console.log(`Success: ${successMessage}`)
            return data
        } catch (error) {
            console.error(`API call failed: ${error.message}`)
            throw error
        } finally {
            setIsLoading((prev) => ({ ...prev, [loadingKey]: false }))
        }
    }

    // Action buttons functionality
    const actionHandlers = {
        switchToWebcam: async () => {
            try {
                await callAPI("/toggle_video_webcam", "webcam", "Switched to webcam")
                setVideoSource("webcam")
                setVideoId("webcam")
                if (isDetecting) setIsDetecting(false)
            } catch (error) {
                // Error already handled in callAPI
            }
        },
        switchToVideo: async () => {
            try {
                await callAPI("/toggle_video_prerecorded", "video", "Switched to pre-recorded video")
                setVideoSource("prerecorded")
                setVideoId("10") // Default video ID for prerecorded
                if (isDetecting) setIsDetecting(false)
            } catch (error) {
                // Error already handled in callAPI
            }
        },
        startDetection: async () => {
            try {
                await callAPI("/toggle_detection_start", "startDetection", "Object detection started")
                setIsDetecting(true)
            } catch (error) {
                // Error already handled in callAPI
            }
        },
        stopDetection: async () => {
            try {
                await callAPI("/toggle_detection_stop", "stopDetection", "Object detection stopped")
                setIsDetecting(false)
            } catch (error) {
                // Error already handled in callAPI
            }
        },
        toggleHistory: () => setShowHistory(!showHistory),
        toggleNlp: () => {
            setIsNlpEnabled(!isNlpEnabled)
            console.log(isNlpEnabled ? "NLP Disabled" : "NLP Enabled")
        },
    }


    // Handle image load to get actual dimensions
    const handleImageLoad = (e) => {
        if (e.target) {
            const { naturalWidth, naturalHeight } = e.target
            console.log("Image loaded with dimensions:", naturalWidth, "x", naturalHeight)

            // Calculate dimensions while respecting max size of 640px
            let width = naturalWidth
            let height = naturalHeight

            if (width > 640) {
                const ratio = 640 / width
                width = 640
                height = Math.round(height * ratio)
            }

            if (height > 640) {
                const ratio = 640 / height
                height = 640
                width = Math.round(width * ratio)
            }

            console.log("Setting container dimensions to:", width, "x", height)
            setImageDimensions({ width, height })
        }
    }

    // Update the getAlertMessage function to use NLP message when available
    const getAlertMessage = () => {
        // If NLP is enabled, and we have an NLP message, use it
        if (isNlpEnabled && nlpMessage) {
            return <>{nlpMessage}</>
        }

        // Otherwise use the hardcoded messages
        if (detections.multiplePersons) {
            return (
                <>
                    <strong>Urgent Alert: Multiple Intruders Detected!</strong>
                    <br />
                    1. Secure All Entry Points – Lock doors and windows, and gather household members in a safe room.
                    <br />
                    2. Contact Authorities Immediately – Report multiple intruders on your property and request priority response.
                    <br />
                    3. Avoid Any Confrontation – Stay quiet and concealed until authorities arrive.
                    <br />
                    4. Provide Details on Entry Points & Movements – Share any information on intruders' movements with law
                    enforcement.
                    <br />
                </>
            )
        } else if (detections.gun) {
            return (
                <>
                    <strong>Critical Alert: Intruder Armed with Gun Detected!</strong>
                    <br />
                    1. Find Immediate Cover – Lock doors, avoid windows, and stay as low as possible.
                    <br />
                    2. Dial Emergency Services – Report the armed intruder with a gun and provide your location.
                    <br />
                    3. Maintain Silence – Keep phone notifications silent and await law enforcement.
                    <br />
                    4. Continue Monitoring Safely – If possible, provide live feed updates to authorities.
                    <br />
                </>
            )
        } else if (detections.knife) {
            return (
                <>
                    <strong>Intruder Armed with Knife Detected!</strong>
                    <br />
                    1. Stay in a Safe Zone – Avoid direct paths and secure yourself behind locked doors.
                    <br />
                    2. Call Emergency Services – Inform them of an armed intruder with a knife on your property.
                    <br />
                    3. Observe from Distance – If safe, watch the intruder's location on the video feed.
                    <br />
                    4. Prepare to Provide Details – When authorities arrive, share any information about the intruder's actions
                    and movements.
                    <br />
                </>
            )
        } else if (detections.person) {
            return (
                <>
                    <strong>Alert: Intruder Detected!</strong>
                    <br />
                    1. Stay Calm – Your system has identified a potential intruder.
                    <br />
                    2. Verify Intruder – Check the live video feed to confirm the presence of an intruder.
                    <br />
                    3. Action Steps:
                    <br />- If confirmed: Call the police immediately and provide your location.
                    <br />- Monitor: Keep the intruder on the feed, but do not engage directly.
                    <br />- Secure: Lock all doors and stay in a safe area until authorities arrive.
                    <br />
                </>
            )
        }
        return null
    }

    // Get the most severe detection for alert display
    const getSeverityLevel = () => {
        if (detections.gun)
            return { type: "gun", level: "critical", icon: <AlertCircle className="h-5 w-5 text-red-600" /> }
        if (detections.knife) return { type: "knife", level: "high", icon: <Scissors className="h-5 w-5 text-red-600" /> }
        if (detections.multiplePersons)
            return { type: "multiple persons", level: "medium", icon: <Users className="h-5 w-5 text-amber-600" /> }
        if (detections.person) return { type: "person", level: "low", icon: <User className="h-5 w-5 text-amber-600" /> }
        return { type: "none", level: "none", icon: null }
    }

    const severity = getSeverityLevel()
    const isAlertActive = severity.type !== "none"
    const alertMessage = getAlertMessage()

    // Get video source URL
    const getVideoSourceUrl = useCallback(() => {
        return `${BACKEND_BASE_URL}/video_feed/${videoId}`;
    }, [videoId]);

    return (
        <SidebarProvider>
            <AppSidebar
                isDetecting={isDetecting}
                isLoading={isLoading}
                onSwitchToWebcam={actionHandlers.switchToWebcam}
                onSwitchToVideo={actionHandlers.switchToVideo}
                onStartDetection={actionHandlers.startDetection}
                onStopDetection={actionHandlers.stopDetection}
                onToggleHistory={actionHandlers.toggleHistory}
                apiConnected={apiConnected}
                isNlpEnabled={isNlpEnabled}
                onToggleNlp={actionHandlers.toggleNlp}
                videoId={videoId}
                setVideoId={setVideoId}
            />
            <SidebarInset>
                <div className="container p-4 max-w-7xl flex flex-col min-h-screen">
                    <div className="flex items-center justify-between mb-4 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="md:hidden" />
                            <h1 className="text-2xl font-bold">Video Stream with Object Detection</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className={`px-3 py-1 rounded-full text-xs font-medium ${isNlpEnabled ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
                            >
                                NLP: {isNlpEnabled ? "ON" : "OFF"}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center mb-4">
                        <div className="text-lg font-medium">Current Date and Time: {currentDateTime}</div>
                        <div className="text-red-600 dark:text-red-400 font-medium">{remainingTime}</div>
                    </div>

                    {/* Main content area */}
                    <div className="flex flex-col gap-6 flex-grow">
                        {/* Video Feed and Indicators - Two column layout */}
                        <div className="flex justify-around">
                            {/* Video Feed - Left column (2/3 width on medium screens) */}
                            <div className="md:col-span-2 flex justify-center">
                                <div
                                    id="video-container"
                                    className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center"
                                    style={{
                                        width: imageDimensions.width ? `${imageDimensions.width}px` : "640px",
                                        height: imageDimensions.height ? `${imageDimensions.height}px` : "360px",
                                        minWidth: "320px",
                                        minHeight: "180px",
                                    }}
                                >
                                    {apiConnected && !videoError ? (
                                        <img
                                            ref={imageRef}
                                            id="videoFeed"
                                            src={getVideoSourceUrl() || "/placeholder.svg"}
                                            alt="Video Feed"
                                            className="w-full h-full object-contain"
                                            style={{
                                                maxWidth: "640px",
                                                maxHeight: "640px",
                                                display: "block", // Ensure it's displayed
                                            }}
                                            onLoad={handleImageLoad}
                                            onError={(e) => {
                                                console.error("Image failed to load:", e)
                                                setVideoError(true)
                                            }}
                                        />
                                    ) : (
                                        // Error message when API is not connected or video fails to load
                                        <div className="flex flex-col items-center justify-center text-white p-8 text-center">
                                            <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
                                            <h3 className="text-xl font-bold mb-2">An error occurred while streaming video</h3>
                                            <p className="mb-4">Please check your connection and try again</p>
                                            <button
                                                onClick={() => {
                                                    setVideoError(false)
                                                    // Force reload the image
                                                    if (imageRef.current) {
                                                        const currentSrc = imageRef.current.src
                                                        imageRef.current.src = ""
                                                        setTimeout(() => {
                                                            if (imageRef.current) imageRef.current.src = currentSrc
                                                        }, 100)
                                                    }
                                                }}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}

                                    {/* Fix the status indicators layout */}
                                    <div className="absolute top-4 left-0 right-0 flex justify-between px-4 flex-wrap">
                                        {/* Source Indicator - Left */}
                                        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap mb-1">
                                            Source: {videoSource === "webcam" ? "Webcam" : "Pre-recorded Video"}
                                        </div>

                                        {/* Detection Status Indicator - Right */}
                                        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 whitespace-nowrap mb-1">
                                            <span className={`h-2 w-2 rounded-full ${isDetecting ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                                            {isDetecting ? "Detection Active" : "Detection Inactive"}
                                        </div>
                                    </div>

                                    {/* Detection Indicators */}
                                    {isDetecting && (
                                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                                            {detections.person && (
                                                <span className="bg-amber-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Person Detected
                                                </span>
                                            )}
                                            {detections.multiplePersons && (
                                                <span className="bg-amber-600/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                    <Users className="h-4 w-4" /> Multiple Persons
                                                </span>
                                            )}
                                            {detections.knife && (
                                                <span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                    <Scissors className="h-4 w-4" /> Knife Detected
                                                </span>
                                            )}
                                            {detections.gun && (
                                                <span className="bg-red-600/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" /> Gun Detected
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detection Status Indicators - Right column (1/3 width on medium screens) */}
                            <div className="">
                                <div className="">
                                    {/* Detection Status Indicators */}
                                    <div className="flex flex-wrap w-[450px]">
                                        <StatusIndicator
                                            active={detections.person}
                                            icon={<User className="h-4 w-4" />}
                                            label="Person"
                                            color="amber"
                                        />
                                        <StatusIndicator
                                            active={detections.multiplePersons}
                                            icon={<Users className="h-4 w-4" />}
                                            label="Multiple Persons"
                                            color="amber"
                                        />
                                        <StatusIndicator
                                            active={detections.knife}
                                            icon={<Scissors className="h-4 w-4" />}
                                            label="Knife"
                                            color="red"
                                        />
                                        <StatusIndicator
                                            active={detections.gun}
                                            icon={<AlertCircle className="h-4 w-4" />}
                                            label="Gun"
                                            color="red"
                                        />
                                    </div>

                                    {/* Text Pane Message */}
                                    {textPaneMessage && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md">
                                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">SYSTEM MESSAGE</h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{textPaneMessage}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Security Alert Card - Below video and indicators */}
                        <Card
                            className={cn(
                                "overflow-hidden transition-colors",
                                isAlertActive
                                    ? "border-red-300 dark:border-red-800 shadow-md"
                                    : "border-amber-200 dark:border-amber-900",
                            )}
                        >
                            <CardHeader
                                className={cn(
                                    "py-3 px-4 flex flex-row items-center justify-between space-y-0 gap-4",
                                    isAlertActive ? "bg-red-50 dark:bg-red-900/30" : "bg-amber-50 dark:bg-amber-900/30",
                                )}
                            >
                                <div>
                                    <CardTitle
                                        className={cn(
                                            "text-base flex items-center gap-2",
                                            isAlertActive ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400",
                                        )}
                                    >
                                        {severity.icon}
                                        <span>Security Alert</span>
                                    </CardTitle>
                                    <CardDescription
                                        className={cn(
                                            "font-medium text-xs mt-0.5",
                                            isAlertActive ? "text-red-600 dark:text-red-300" : "text-amber-600 dark:text-amber-300",
                                        )}
                                    >
                                        {isAlertActive ? "Critical security notification" : "System monitoring active"}
                                    </CardDescription>
                                </div>
                                <div
                                    className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                        isAlertActive
                                            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                            : "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
                                    )}
                                >
                                    {isAlertActive ? <AlertCircle className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div
                                    className={cn(
                                        "rounded-md p-3 text-sm h-32 overflow-y-auto",
                                        isAlertActive
                                            ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700"
                                            : "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-700",
                                    )}
                                >
                                    {isAlertActive ? (
                                        <div className="text-gray-700 dark:text-gray-200 space-y-2">{alertMessage}</div>
                                    ) : (
                                        <div className="space-y-2 text-gray-700 dark:text-gray-200">
                                            <p className="font-medium">System is monitoring for potential threats.</p>
                                            <p className="font-medium">No threats detected at this time.</p>
                                            <p className="font-medium">Status: Normal</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detection History */}
                        {showHistory && (
                            <div className="mt-4 mb-6 p-4 border rounded-lg bg-muted/50">
                                <h3 className="font-medium mb-2">Detection History</h3>
                                {detectedObjects.length > 0 ? (
                                    <ul className="space-y-1">
                                        {detectedObjects.map((obj) => (
                                            <li key={obj.id} className="text-sm flex justify-between">
                                                <span>{obj.type} detected {(obj.message && obj.message !== '') ? `(${obj.message})` : ''}</span>
                                                <span className="text-muted-foreground">{obj.timestamp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No detection history available</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

