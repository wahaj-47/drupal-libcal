import React from "react"
import { motion } from "framer-motion";

const RoomSkeleton = () => {
    return (
        <div
            class="space-room">
            <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div class="roomHeader pointer">
                    <div class="roomImage">
                        <div class="roomImageSkeleton"></div>
                    </div>
                    <div class="roomLabel">
                        <h3>
                            <div class="roomNameSkeleton"></div>
                        </h3>
                        <span class="roomZone">
                            <div class="roomZoneSkeleton"></div>
                        </span>
                        <span className="available">
                        </span>
                    </div>
                </div>
            </motion.a>
            <div class="roomDetails">
                <p>
                    <div class="roomDetailsSkeleton"></div>
                </p>
                <div class="roomFooter">
                    <div class="roomFooterSkeleton"></div>
                    <div class="roomFooterSkeleton"></div>
                    <div class="roomFooterSkeleton"></div>
                </div>
            </div>
        </div>
    )
}

export default RoomSkeleton