import "../terminal.css"

type Suggestion = {
    id: string
    text: string
    status: string
    user: {
        name: string
        handle: string
        image: string
    }
}

const SUGGESTIONS: Suggestion[] = [
    {
        id: "1",
        text: "the cursor gets stuck if we change settings during a round, fix it",
        status: "Implemented",
        user: {
            name: "Syskey",
            handle: "@Syskey_SK",
            image: "https://unavatar.io/twitter/Syskey_SK",
        }

    },
    {
        id: "2",
        text: "allow to disable animations for the cursor (causes lag when typing quickly), and prevent the current char from growing/bolding on focus (prevents layout shift)",
        status: "Implemented",
        user: {
            name: "Soham",
            handle: "@soham_btw",
            image: "https://unavatar.io/twitter/soham_btw",
        }
    },
    {
        id: "3",
        text: "let the website have more sample books",
        status: "Implemented",
        user: {
            name: "aetosdios",
            handle: "@aetosdios_",
            image: "https://unavatar.io/twitter/aetosdios_",
        }

    },
    {
        id: "4",
        text: "please fix the word wrap though (like the words are being split at the end of the lines)",
        status: "Implemented",
        user: {
            name: "jerkeyray",
            handle: "@jerkeyray",
            image: "https://unavatar.io/twitter/jerkeyray",
        }
    },
    {
        id: "5",
        text: "only thing i didn't like was i had to capitalize few letters cuz i hate doing that shit (personal preference)",
        status: "Implemented",
        user: {
            name: "prthkys",
            handle: "@prthkys",
            image: "https://unavatar.io/twitter/prthkys",
        }
    },
    {
        id: "6",
        text: "my cursor wobbles while i type, it pushes nearby text and makes everything look distorted. It’d feel much better if it just glided over the letters smoothly instead of shifting them around.",
        status: "Implemented",
        user: {
            name: "kaizakinn",
            handle: "@kaizakinn",
            image: "https://unavatar.io/twitter/kaizakinn",
        }
    },
    {
        id: "7",
        text: "can you please make the text slightly less jiggly? that would be great!",
        status: "Implemented",
        user: {
            name: "nibbletonbuilds",
            handle: "@nibbletonbuilds",
            image: "https://unavatar.io/twitter/nibbletonbuilds",
        }
    },
    {
        id: "8",
        text: "It can’t differentiate between dumb quotes and smart quotes.",
        status: "Implemented",
        user: {
            name: "vegrolled",
            handle: "@vegrolled",
            image: "https://unavatar.io/twitter/vegrolled",
        }

    },
    {
        id: "9",
        text: "make the login and create acc with terminal as well",
        status: "Implemented",
        user: {
            name: "positronx",
            handle: "@positronx_",
            image: "https://unavatar.io/twitter/positronx_",
        }
    },
    {
        id: "10",
        text: "make a difficulty based leaderboard aswell",
        status: "In Progress",
        user: {
            name: "vineet",
            handle: "@x0_vineet",
            image: "https://unavatar.io/twitter/x0_vineet",
        }
    }
]

export default function CreditsTab() {
    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            <div className="h-full border border-[#41ff5f30] rounded-xl p-4 md:p-6 relative overflow-hidden bg-[#001a0f]/40 flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#41ff5f]/20"></div>
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-[#41ff5f] text-shadow-glow tracking-wider">
                    SUGGESTIONS:
                </h2>

                <div className="space-y-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                    {SUGGESTIONS.map((suggestion) => (
                        <div key={suggestion.id} className="relative group bg-[#41ff5f]/5 rounded-lg p-3 md:bg-transparent md:p-0">
                            <div className="flex flex-col-reverse md:flex-row items-end md:items-start gap-2 md:gap-4">
                                <div className="w-full md:flex-1">
                                    <p className="text-[#41ff5f] text-base md:text-lg font-medium leading-relaxed">
                                        "{suggestion.text}"
                                    </p>
                                    <div className="flex items-center gap-3 mt-3 pl-0 md:pl-4 md:border-l-2 md:border-[#41ff5f30]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 md:w-6 md:h-6 rounded-full overflow-hidden border border-[#41ff5f50]">
                                                {suggestion.user.image ? (
                                                    <img src={suggestion.user.image} alt={suggestion.user.handle} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#003018] flex items-center justify-center text-[10px] text-[#41ff5f]">
                                                        {suggestion.user.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm text-[#7bff9a]/60 font-mono">{suggestion.user.handle}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-1 md:mb-0">
                                    <span className={`
                        px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold rounded border border-dashed
                        ${suggestion.status === 'Implemented'
                                            ? 'text-[#41ff5f] border-[#41ff5f] bg-[#41ff5f]/10'
                                            : 'text-[#ffbf00] border-[#ffbf00] bg-[#ffbf00]/10'}
                    `}>
                                        {suggestion.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
