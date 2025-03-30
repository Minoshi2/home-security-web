"use client"
import { AlertCircle, Camera, History, Laptop, MessageSquare, Moon, Play, Square, Sun, Video } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface AppSidebarProps {
    isDetecting: boolean
    isLoading: {
        webcam: boolean
        video: boolean
        startDetection: boolean
        stopDetection: boolean
    }
    onSwitchToWebcam: () => Promise<void>
    onSwitchToVideo: () => Promise<void>
    onStartDetection: () => Promise<void>
    onStopDetection: () => Promise<void>
    apiConnected: boolean
    isNlpEnabled: boolean
    onToggleNlp: () => void
    videoId: string
    setVideoId: Function
}

export function AppSidebar({
    isDetecting,
    isLoading,
    onSwitchToWebcam,
    onSwitchToVideo,
    onStartDetection,
    onStopDetection,
    apiConnected,
    isNlpEnabled,
    onToggleNlp,
    videoId,
    setVideoId,
}: AppSidebarProps) {
    const { setTheme } = useTheme()

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="p-2">
                    <h2 className="text-lg font-semibold">Security Controls</h2>
                    {!apiConnected && (
                        <div className="mt-2 bg-destructive/10 text-destructive px-3 py-1 rounded-md text-sm flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" /> API Connection Error
                        </div>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={onSwitchToWebcam} disabled={isLoading.webcam} className="w-full justify-start">
                            {isLoading.webcam ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <Camera className="mr-2 h-4 w-4" />
                                    <span>Switch to Webcam</span>
                                </>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={onSwitchToVideo} disabled={isLoading.video} className="w-full justify-start">
                            {isLoading.video ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <Video className="mr-2 h-4 w-4" />
                                    <span>Switch to Video</span>
                                </>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onStartDetection}
                            disabled={isDetecting || isLoading.startDetection}
                            className={`w-full justify-start ${isDetecting ? "bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                        >
                            {isLoading.startDetection ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    <span>Start Detection</span>
                                </>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onStopDetection}
                            disabled={!isDetecting || isLoading.stopDetection}
                            className="w-full justify-start"
                        >
                            {isLoading.stopDetection ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <Square className="mr-2 h-4 w-4" />
                                    <span>Stop Detection</span>
                                </>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <Link href="/history" className="w-full">
                            <SidebarMenuButton className="w-full justify-start">
                                <History className="mr-2 h-4 w-4" />
                                <span>View History</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarSeparator className="my-2" />

                {/* NLP Toggle */}
                <div className="px-4 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="nlp-toggle" className="text-sm font-medium">
                                NLP Processing
                            </Label>
                        </div>
                        <Switch id="nlp-toggle" checked={isNlpEnabled} onCheckedChange={onToggleNlp} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isNlpEnabled ? "Natural language processing is enabled" : "Natural language processing is disabled"}
                    </p>
                </div>

                <SidebarSeparator className="my-2" />

                <div className="px-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Video />
                                <span>Video ID: {videoId}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setVideoId("1")} className="flex items-center gap-2">
                                <span>1</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVideoId("2")} className="flex items-center gap-2">
                                <span>2</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVideoId("5")} className="flex items-center gap-2">
                                <span>5</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVideoId("6")} className="flex items-center gap-2">
                                <span>6</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVideoId("7")} className="flex items-center gap-2">
                                <span>7</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVideoId("8")} className="flex items-center gap-2">
                                <span>8</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVideoId("9")} className="flex items-center gap-2">
                                <span>9</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVideoId("10")} className="flex items-center gap-2">
                                <span>10</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Theme Toggle */}
                <div className="px-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                                <span>Theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                <span>Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                <span>Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                                <Laptop className="h-4 w-4" />
                                <span>System</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4 text-xs text-muted-foreground">
                    <p>Security System v1.0</p>
                    <p>© 2025 Security Inc.</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}

function LoadingSpinner() {
    return (
        <span className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span>Loading...</span>
    </span>
    )
}

