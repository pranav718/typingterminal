import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Tweet } from "react-tweet"
import "../terminal.css"

const TWEET_IDS = [
    "1998760457927291088",
    "1998726044489232787",
    "1998745858628866142",
    "1998729212778393974",
    "1998724086126751771",
    "2000282792316612890",
    "1998720546515857758",
    "1998737723725582806",
    "1999027435946520610",
    "1999065608907104746",
    "1998720675327128037",
    "1998755104569352622",
    "1998782532364693945",
    "1998750674914582540",
    "1999075708367421709",
    "1998756922573701402",
    "1999106787354788180",
    "1998731344814235922",
    "1998725340278173745",
    "1998730782513184835",
    "1998732517717794900",
    "1998748235993849978",
    "1998775807129600189",
    "1998749199073161319",
    "1998752980452126925",
    "1998749557640016334",
    "1998749622249095635",
    "1998725002393444634",
    "1998844430795813374",
    "1998844669812420881",
    "1998867617323561067",
    "2000424807805116711",
    "1999027970988716310",
    "2000614363036869075",
]

export default function SpecialThanks() {
    const [currentTweetIndex, setCurrentTweetIndex] = useState(0)

    useEffect(() => {
        if (TWEET_IDS.length <= 1) return

        const interval = setInterval(() => {
            setCurrentTweetIndex((prev) => (prev + 1) % TWEET_IDS.length)
        }, 8000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col relative h-auto md:h-[600px] justify-between">
            <h3 className="text-lg font-bold mb-4 text-[#41ff5f] text-center border-b border-[#41ff5f30] pb-2">
                my special thanks to:
            </h3>

            <div className="flex-1 w-full relative flex flex-col items-center justify-center my-3 md:my-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentTweetIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex justify-center"
                    >
                        <div className="light-theme w-full h-[240px] md:h-[280px] overflow-y-auto custom-scrollbar rounded-xl" data-theme="dark">
                            <Tweet id={TWEET_IDS[currentTweetIndex]} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-2 md:mt-4 p-2 md:p-3 border border-dashed border-[#41ff5f40] rounded bg-[#41ff5f]/5">
                <p className="text-[10px] md:text-xs text-center text-[#7bff9a]/80 leading-relaxed font-mono">
                    you can get your name here by contributing/giving suggestions
                    <br />
                    <span className="text-[#41ff5f] font-bold mt-0.5 md:mt-1 block">thank you!</span>
                </p>
            </div>
        </div>
    )
}
