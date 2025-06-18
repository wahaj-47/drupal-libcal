import React from "react";
import { motion } from 'framer-motion'
import parse from "html-react-parser";

const origin = window.location.origin

const Room = ({ room }) => {
    const { id, name, groupName, groupId, lid, image, zoneName, availability = 'checking', availableIn, description, globalFooter, footer } = room;

    return (
        <div
            class="space-room">
            <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                href={`${origin}/spaces/booking/reserve?id=${id}&category=${groupName}&categoryId=${groupId}&locationId=${lid}`}>
                <div class="roomHeader pointer">
                    <div class="roomImage">
                        {image && <img src={image} className="preview-img"></img>}
                    </div>
                    <div class="roomLabel">
                        <h3>{name}</h3>
                        <span class="roomZone">{zoneName}</span>
                        {availability === 'checking' && <span>Checking availability...</span>}
                        {availability === "now" && <span className="available">Available Now</span>}
                        {availability === "soom" && <span>Available in {availableIn}</span>}
                    </div>
                </div>
            </motion.a>
            <div class="roomDetails">
                <p>{parse(description)}</p>
                <div class="roomFooter">
                    {globalFooter && parse(globalFooter.markup.value)}
                    {footer && parse(footer.markup.value)}
                    {/* insert room directions here */}
                </div>
            </div>
        </div>
    );
};

export default Room