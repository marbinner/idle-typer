/**
 * Bickering Challenge Data
 * Twitter argument conversations for the typing challenge mini-game
 */

export const BICKERING_CONVERSATIONS = [
    // ==========================================================================
    // TECH CATEGORY - Programming, gadgets, internet arguments
    // ==========================================================================
    {
        id: 'tech_1',
        category: 'tech',
        opponent: {
            name: 'CodeBro420',
            icon: '💻',
            handle: '@codebro420'
        },
        openingTweet: "Imagine using Python in 2024 lmao",
        exchanges: [
            {
                playerReply: "Python runs half the internet and all of AI but go off king",
                opponentResponse: "Yeah and it runs it SLOWLY 🐌"
            },
            {
                playerReply: "Speed doesn't matter when your code actually works first try",
                opponentResponse: "Copium. Just admit you can't handle real languages"
            },
            {
                playerReply: "I'll take readable code over your spaghetti C++ any day",
                opponentResponse: "...okay that one hurt"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'tech_2',
        category: 'tech',
        opponent: {
            name: 'TabWarrior',
            icon: '⌨️',
            handle: '@tabwarrior'
        },
        openingTweet: "Spaces are for people who can't configure their editor",
        exchanges: [
            {
                playerReply: "Tabs literally break on every other system but sure",
                opponentResponse: "Skill issue. Learn to set tab width"
            },
            {
                playerReply: "I'd rather my code look the same everywhere thanks",
                opponentResponse: "Enjoy wasting kilobytes on spaces lol"
            },
            {
                playerReply: "My SSD will survive. Will your team's sanity?",
                opponentResponse: "Why are you right I hate this"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'tech_3',
        category: 'tech',
        opponent: {
            name: 'AppleFanatic',
            icon: '🍎',
            handle: '@appleloyalist'
        },
        openingTweet: "Android users really out here with 2GB RAM thinking they're tech savvy",
        exchanges: [
            {
                playerReply: "My phone has 12GB RAM and costs half your iPhone but okay",
                opponentResponse: "Yeah and it'll last half as long too"
            },
            {
                playerReply: "I can replace the battery myself so probably longer actually",
                opponentResponse: "Imagine needing to repair your own phone like a peasant"
            },
            {
                playerReply: "Imagine paying $1000 to not own a headphone jack",
                opponentResponse: "I'm blocking you"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'tech_4',
        category: 'tech',
        opponent: {
            name: 'VimLord',
            icon: '⚔️',
            handle: '@vimlord'
        },
        openingTweet: "Emacs is just an operating system missing a good text editor",
        exchanges: [
            {
                playerReply: "Vim users spend more time bragging than actually coding",
                opponentResponse: "At least we don't need a tutorial to exit our editor"
            },
            {
                playerReply: "You literally do though. Everyone googles 'how to exit vim'",
                opponentResponse: "That's just initiation. After that it's superior"
            },
            {
                playerReply: "VS Code has vim keybindings. I win both ways.",
                opponentResponse: "...I also use VS Code with vim bindings"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'tech_5',
        category: 'tech',
        opponent: {
            name: 'JavaScriptJunkie',
            icon: '🟨',
            handle: '@jsalltheway'
        },
        openingTweet: "Why learn multiple languages when JS does everything?",
        exchanges: [
            {
                playerReply: "Because some of us like type safety and sanity",
                opponentResponse: "TypeScript exists buddy"
            },
            {
                playerReply: "Oh so you admit vanilla JS isn't enough?",
                opponentResponse: "That's not... wait"
            },
            {
                playerReply: "Checkmate. Also your sort function is broken by default.",
                opponentResponse: "[1,2,10].sort() has left the chat"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'tech_6',
        category: 'tech',
        opponent: {
            name: 'CryptoKing',
            icon: '₿',
            handle: '@cryptoking'
        },
        openingTweet: "Have fun staying poor while I'm making bank on blockchain",
        exchanges: [
            {
                playerReply: "How's that going for you after the crash?",
                opponentResponse: "It's called a dip bro, buy the dip"
            },
            {
                playerReply: "You've been buying dips for 2 years straight my guy",
                opponentResponse: "DCA strategy. You wouldn't understand"
            },
            {
                playerReply: "I understand you could've just bought index funds",
                opponentResponse: "Mom can I borrow money for rent"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'tech_7',
        category: 'tech',
        opponent: {
            name: 'ReactRanger',
            icon: '⚛️',
            handle: '@reactranger'
        },
        openingTweet: "Vanilla JS in 2024? Just use React like a normal person",
        exchanges: [
            {
                playerReply: "Why import 50MB to make a toggle button",
                opponentResponse: "It's not 50MB you're exaggerating"
            },
            {
                playerReply: "Fine. 45MB. Much better.",
                opponentResponse: "Component reusability is worth it"
            },
            {
                playerReply: "Your portfolio site doesn't need a virtual DOM bestie",
                opponentResponse: "Why do I feel so attacked rn"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'tech_8',
        category: 'tech',
        opponent: {
            name: 'LinuxElitist',
            icon: '🐧',
            handle: '@linuxelitist'
        },
        openingTweet: "Imagine paying for an OS when Linux exists for free",
        exchanges: [
            {
                playerReply: "Imagine spending 6 hours fixing audio drivers",
                opponentResponse: "That's just on bad distros. Skill issue tbh"
            },
            {
                playerReply: "My grandma can use Windows. Can she use Arch?",
                opponentResponse: "Why would she want to? She's not a developer"
            },
            {
                playerReply: "So it's not for normal people. Thanks for proving my point.",
                opponentResponse: "I use Ubuntu now actually"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'tech_9',
        category: 'tech',
        opponent: {
            name: 'AIDoomer',
            icon: '🤖',
            handle: '@aidoomer'
        },
        openingTweet: "AI is stealing all our jobs and y'all just posting memes about it",
        exchanges: [
            {
                playerReply: "It's a tool not a replacement. Learn to use it.",
                opponentResponse: "That's what they said about automation"
            },
            {
                playerReply: "And yet here we are, still employed and coding",
                opponentResponse: "Give it 5 years, you'll see"
            },
            {
                playerReply: "You've been saying that since GPT-2 my guy",
                opponentResponse: "Okay but have you SEEN GPT-4 it's actually crazy"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'tech_10',
        category: 'tech',
        opponent: {
            name: 'RustEvangelist',
            icon: '🦀',
            handle: '@rustevangelist'
        },
        openingTweet: "If your language has a garbage collector you're not a real programmer",
        exchanges: [
            {
                playerReply: "If you spend all day fighting the borrow checker that's on you",
                opponentResponse: "The borrow checker prevents bugs you'd spend weeks debugging"
            },
            {
                playerReply: "Or I could just write tests like a normal person",
                opponentResponse: "Tests don't prevent memory leaks"
            },
            {
                playerReply: "Good thing GC does. Anyway my app shipped last month, hbu?",
                opponentResponse: "Still compiling"
            }
        ],
        difficulty: 'hard'
    },

    // ==========================================================================
    // POP CULTURE CATEGORY - Movies, music, TV, gaming, sports
    // ==========================================================================
    {
        id: 'popculture_1',
        category: 'popculture',
        opponent: {
            name: 'CinemaSnob',
            icon: '🎬',
            handle: '@realcinephile'
        },
        openingTweet: "Marvel movies aren't real cinema, they're just CGI noise",
        exchanges: [
            {
                playerReply: "Tell that to the billions in box office receipts",
                opponentResponse: "Money doesn't equal quality sweaty 💅"
            },
            {
                playerReply: "At least people actually watch them unlike your pretentious art films",
                opponentResponse: "You wouldn't understand Tarkovsky even if you tried"
            },
            {
                playerReply: "I understand fun, you should try it sometime",
                opponentResponse: "...okay Guardians 3 was pretty good I guess"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'popculture_2',
        category: 'popculture',
        opponent: {
            name: 'ConsoleCrusader',
            icon: '🎮',
            handle: '@pcmasterrace'
        },
        openingTweet: "Console gaming is for casuals who can't afford real setups",
        exchanges: [
            {
                playerReply: "I just want to play games not troubleshoot drivers for 3 hours",
                opponentResponse: "That literally never happens you just need to update your BIOS"
            },
            {
                playerReply: "Yeah exactly my point thanks",
                opponentResponse: "It's not that hard if you're not tech illiterate???"
            },
            {
                playerReply: "My console boots up in 10 seconds and just works",
                opponentResponse: "...okay fair but my framerates tho"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'popculture_3',
        category: 'popculture',
        opponent: {
            name: 'SportsballStan',
            icon: '⚽',
            handle: '@futbol4ever'
        },
        openingTweet: "Football (soccer) is the only real sport, everything else is regional nonsense",
        exchanges: [
            {
                playerReply: "Americans invented basketball, baseball, and football so we're fine",
                opponentResponse: "Those are literally just commercials interrupted by occasional gameplay"
            },
            {
                playerReply: "Better than 90 minutes of flopping and 0-0 draws",
                opponentResponse: "You clearly don't understand the beautiful game's tactical nuance"
            },
            {
                playerReply: "I understand boredom when I see it",
                opponentResponse: "okay the flopping is getting ridiculous I'll give you that"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'popculture_4',
        category: 'popculture',
        opponent: {
            name: 'SequelSkeptic',
            icon: '⭐',
            handle: '@starwarspur1st'
        },
        openingTweet: "The Last Jedi ruined Star Wars forever and that's just facts",
        exchanges: [
            {
                playerReply: "The prequels exist and you're mad about TLJ?",
                opponentResponse: "At least the prequels had W O R L D B U I L D I N G"
            },
            {
                playerReply: "They had Jar Jar Binks",
                opponentResponse: "Jar Jar was actually a Sith Lord if you watch the YouTube videos"
            },
            {
                playerReply: "This is why nobody invites you to parties",
                opponentResponse: "I don't even like Star Wars that much anymore anyway"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'popculture_5',
        category: 'popculture',
        opponent: {
            name: 'RockPurist',
            icon: '🎸',
            handle: '@dadrocksonly'
        },
        openingTweet: "Modern music is just computer noises. Real music died in the 90s",
        exchanges: [
            {
                playerReply: "Okay grandpa let's get you back to bed",
                opponentResponse: "I'm 24 but I was born in the wrong generation 😤"
            },
            {
                playerReply: "That explains so much actually",
                opponentResponse: "Kids today don't know what REAL guitars sound like"
            },
            {
                playerReply: "I bet you can't even play Wonderwall",
                opponentResponse: "...I'm learning okay the F chord is hard"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'popculture_6',
        category: 'popculture',
        opponent: {
            name: 'BingeBaron',
            icon: '📺',
            handle: '@tvcritic2k'
        },
        openingTweet: "If you liked the Game of Thrones ending you have no taste",
        exchanges: [
            {
                playerReply: "It wasn't great but you've been whining for 6 years straight",
                opponentResponse: "And I'll whine for 6 more! They RUINED Daenerys's arc!"
            },
            {
                playerReply: "Maybe go outside and get a hobby?",
                opponentResponse: "My hobby is pointing out bad writing and I'm VERY good at it"
            },
            {
                playerReply: "Your hobby is being insufferable on the internet",
                opponentResponse: "...my therapist says I need to let go"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'popculture_7',
        category: 'popculture',
        opponent: {
            name: 'AnimeCritic',
            icon: '⚔️',
            handle: '@subsoverdubs'
        },
        openingTweet: "If you watch anime in English dub you're not a real fan",
        exchanges: [
            {
                playerReply: "Some of us like to watch the animation instead of reading",
                opponentResponse: "You're missing the ORIGINAL voice acting's emotional depth!!"
            },
            {
                playerReply: "Cowboy Bebop dub is better than the sub and you know it",
                opponentResponse: "That's the ONE exception and- wait actually yeah you're right"
            },
            {
                playerReply: "Also Fullmetal Alchemist dub is perfect",
                opponentResponse: "okay fine there are a few good dubs I guess"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'popculture_8',
        category: 'popculture',
        opponent: {
            name: 'PlatformWarrior',
            icon: '🎭',
            handle: '@spotifyisbad'
        },
        openingTweet: "Spotify users don't actually care about music, real fans buy vinyl",
        exchanges: [
            {
                playerReply: "I'm not paying 40 dollars for an album I can stream for free",
                opponentResponse: "The WARMTH of vinyl, the EXPERIENCE, the album ART"
            },
            {
                playerReply: "My phone fits in my pocket, your record player doesn't",
                opponentResponse: "You can't appreciate the ritual of carefully placing the needle"
            },
            {
                playerReply: "I appreciate not having to flip it every 20 minutes",
                opponentResponse: "...okay streaming is convenient I'll admit"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'popculture_9',
        category: 'popculture',
        opponent: {
            name: 'FranchiseFanatic',
            icon: '🦇',
            handle: '@dcdefender'
        },
        openingTweet: "DC movies are darker and more mature than Marvel's silly comedies",
        exchanges: [
            {
                playerReply: "Being dark doesn't make it good, Batman v Superman was a mess",
                opponentResponse: "You just don't understand Snyder's philosophical vision"
            },
            {
                playerReply: "I understood he made Superman depressing which is the worst crime",
                opponentResponse: "It's a DECONSTRUCTION of the hero myth educate yourself"
            },
            {
                playerReply: "The Snyder Cut was 4 hours long and still boring",
                opponentResponse: "I fell asleep twice watching it but I'll never admit that publicly"
            }
        ],
        difficulty: 'hard'
    },
    {
        id: 'popculture_10',
        category: 'popculture',
        opponent: {
            name: 'ChefsToxic',
            icon: '🏈',
            handle: '@chiefsking'
        },
        openingTweet: "Taylor Swift ruined football by dating Travis Kelce, real fans are leaving",
        exchanges: [
            {
                playerReply: "The NFL literally has record viewership but go off I guess",
                opponentResponse: "Those are fake fans who only care about celebrity drama!!"
            },
            {
                playerReply: "More viewers means more money for your team so you're welcome",
                opponentResponse: "It's about the PURITY of the sport not commercialization"
            },
            {
                playerReply: "Football is literally nothing but commercials already",
                opponentResponse: "...fine but they show her too much on camera"
            }
        ],
        difficulty: 'medium'
    },

    // ==========================================================================
    // INTERNET CULTURE CATEGORY - Social media, memes, online behavior
    // ==========================================================================
    {
        id: 'internet_1',
        category: 'internet',
        opponent: {
            name: 'RatioKing',
            icon: '📉',
            handle: '@ratioking99'
        },
        openingTweet: "Ratio + you fell off + no followers + L",
        exchanges: [
            {
                playerReply: "You have 47 followers and an anime profile pic",
                opponentResponse: "At least I have good taste in anime unlike you"
            },
            {
                playerReply: "Your pinned tweet has 2 likes and one is from your mom",
                opponentResponse: "She's very supportive actually, very nice lady"
            },
            {
                playerReply: "Wholesome but you still can't ratio me",
                opponentResponse: "...fair enough, have a nice day"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'internet_2',
        category: 'internet',
        opponent: {
            name: 'MainCharacter',
            icon: '🎭',
            handle: '@imthemaincharacter'
        },
        openingTweet: "Everyone at Starbucks was staring at me today. I'm just too iconic.",
        exchanges: [
            {
                playerReply: "They were staring because you held up the line for 10 minutes",
                opponentResponse: "My oat milk specifications are IMPORTANT"
            },
            {
                playerReply: "Nobody knows who you are",
                opponentResponse: "I have 300 followers, I'm basically an influencer"
            },
            {
                playerReply: "That's less than my high school guidance counselor",
                opponentResponse: "Okay that hurt actually, I'm logging off"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'internet_3',
        category: 'internet',
        opponent: {
            name: 'TouchGrassEnjoyer',
            icon: '🌱',
            handle: '@grassdiscourse'
        },
        openingTweet: "You people need to go outside and touch grass immediately",
        exchanges: [
            {
                playerReply: "You've tweeted 47 times today",
                opponentResponse: "That's different, I'm providing a public service"
            },
            {
                playerReply: "Your last outside photo was from 2019",
                opponentResponse: "How did you... did you scroll through my entire timeline?"
            },
            {
                playerReply: "Maybe YOU should touch grass",
                opponentResponse: "I've become the very thing I swore to destroy"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'internet_4',
        category: 'internet',
        opponent: {
            name: 'EngagementFarmer',
            icon: '🚜',
            handle: '@engagementmaxxer'
        },
        openingTweet: "Unpopular opinion: water is actually wet. RT if you agree!",
        exchanges: [
            {
                playerReply: "That's not unpopular or interesting",
                opponentResponse: "Already got 12 RTs so clearly people care"
            },
            {
                playerReply: "11 of those are bots",
                opponentResponse: "Engagement is engagement, the algorithm doesn't discriminate"
            },
            {
                playerReply: "You're what's wrong with this app",
                opponentResponse: "Whatever, I'm pivoting to LinkedIn anyway"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'internet_5',
        category: 'internet',
        opponent: {
            name: 'ParasocialPete',
            icon: '💕',
            handle: '@streamerfanatic'
        },
        openingTweet: "My streamer would NEVER do that, I know them personally",
        exchanges: [
            {
                playerReply: "You've never met them",
                opponentResponse: "They said my name on stream once, we have a connection"
            },
            {
                playerReply: "They were reading a donation message",
                opponentResponse: "Still counts, they smiled when they said it"
            },
            {
                playerReply: "This is genuinely concerning, seek help",
                opponentResponse: "You know what, you might be right actually"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'internet_6',
        category: 'internet',
        opponent: {
            name: 'HotTakeHarvey',
            icon: '🔥',
            handle: '@controversialking'
        },
        openingTweet: "Hot take: people who drink water are just sheep following trends",
        exchanges: [
            {
                playerReply: "Water predates trends by billions of years",
                opponentResponse: "That's exactly what Big Water wants you to think"
            },
            {
                playerReply: "Big Water isn't real",
                opponentResponse: "Nestle literally exists but go off I guess"
            },
            {
                playerReply: "Okay that's actually a fair point",
                opponentResponse: "Wait really? Uh, thanks? I'm confused now"
            }
        ],
        difficulty: 'hard'
    },
    {
        id: 'internet_7',
        category: 'internet',
        opponent: {
            name: 'ChronicallyOnline',
            icon: '💻',
            handle: '@terminallywired'
        },
        openingTweet: "Just woke up (2pm) time to check what discourse I missed",
        exchanges: [
            {
                playerReply: "The sun exists, you should visit it sometime",
                opponentResponse: "Can't, I have 15 group chats to monitor"
            },
            {
                playerReply: "What do you even talk about in 15 group chats",
                opponentResponse: "Mostly screenshots of other group chats honestly"
            },
            {
                playerReply: "That's the saddest thing I've ever heard",
                opponentResponse: "Yeah you're right, I need to reevaluate my life"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'internet_8',
        category: 'internet',
        opponent: {
            name: 'FollowerCounter',
            icon: '📊',
            handle: '@cloutchaser5000'
        },
        openingTweet: "Imagine having under 1k followers in 2025 lmaooo couldn't be me",
        exchanges: [
            {
                playerReply: "You bought 800 of those followers",
                opponentResponse: "Those were INVESTMENTS in my personal brand"
            },
            {
                playerReply: "Your engagement rate is 0.3 percent",
                opponentResponse: "Quality over quantity... wait no, I mean..."
            },
            {
                playerReply: "You played yourself",
                opponentResponse: "I'm deleting this app and starting a blog"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'internet_9',
        category: 'internet',
        opponent: {
            name: 'QuoteTweetWarrior',
            icon: '⚔️',
            handle: '@dunkonmain'
        },
        openingTweet: "QT-ing this for my mutuals to dunk on. This person is so wrong.",
        exchanges: [
            {
                playerReply: "You could have just disagreed normally",
                opponentResponse: "But then how would I get validation from strangers?"
            },
            {
                playerReply: "By having an actual personality",
                opponentResponse: "Wow okay, that was actually mean, my mutuals attack!"
            },
            {
                playerReply: "Nobody came to help you",
                opponentResponse: "...this is the worst day of my life"
            }
        ],
        difficulty: 'hard'
    },
    {
        id: 'internet_10',
        category: 'internet',
        opponent: {
            name: 'ReplyGuyRick',
            icon: '🤓',
            handle: '@actuallyitsreply'
        },
        openingTweet: "Actually, if you read the terms of service, you'd know you're wrong",
        exchanges: [
            {
                playerReply: "Nobody asked you to reply to this",
                opponentResponse: "It's a public forum, I can reply to whatever I want"
            },
            {
                playerReply: "You reply to every single post in this thread",
                opponentResponse: "Someone has to maintain intellectual standards here"
            },
            {
                playerReply: "You've been muted by the original poster",
                opponentResponse: "WHAT? But I was just trying to help educate..."
            }
        ],
        difficulty: 'medium'
    },

    // ==========================================================================
    // LIFESTYLE CATEGORY - Food, fitness, productivity, adulting
    // ==========================================================================
    {
        id: 'lifestyle_1',
        category: 'lifestyle',
        opponent: {
            name: 'GrindsetGuru',
            icon: '⏰',
            handle: '@grindsetguru'
        },
        openingTweet: "If you're not waking up at 5am you're already behind",
        exchanges: [
            {
                playerReply: "Behind who? The sun isn't even up yet",
                opponentResponse: "That's the point. Beat the sun, beat life."
            },
            {
                playerReply: "I beat life by getting 8 hours of sleep",
                opponentResponse: "Sleep is for the weak. I'll sleep when I'm dead."
            },
            {
                playerReply: "At this rate that'll be pretty soon",
                opponentResponse: "...my doctor did say I need to slow down"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'lifestyle_2',
        category: 'lifestyle',
        opponent: {
            name: 'CoffeeConnoisseur',
            icon: '☕',
            handle: '@beanelitist'
        },
        openingTweet: "If your coffee costs less than $7 you're drinking garbage water",
        exchanges: [
            {
                playerReply: "It's literally the same beans just marked up 400%",
                opponentResponse: "You clearly can't taste the hand-picked Ethiopian terroir"
            },
            {
                playerReply: "I can taste my rent money still in my wallet though",
                opponentResponse: "Some of us value quality over savings"
            },
            {
                playerReply: "Your credit card statement says otherwise",
                opponentResponse: "okay the $43 latte yesterday was excessive I admit"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'lifestyle_3',
        category: 'lifestyle',
        opponent: {
            name: 'PizzaPurist',
            icon: '🍕',
            handle: '@italiandad'
        },
        openingTweet: "Pineapple on pizza is a crime against humanity and Italy",
        exchanges: [
            {
                playerReply: "Italy literally didn't invent Hawaiian pizza though",
                opponentResponse: "Exactly! Because we have STANDARDS and DIGNITY"
            },
            {
                playerReply: "You put corn on pizza in Italy my guy",
                opponentResponse: "That's different, corn is sophisticated"
            },
            {
                playerReply: "But fruit that's already sweet isn't? Make it make sense",
                opponentResponse: "...okay I tried it once and it wasn't terrible"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'lifestyle_4',
        category: 'lifestyle',
        opponent: {
            name: 'IronChad',
            icon: '💪',
            handle: '@gymislife'
        },
        openingTweet: "Rest days are for quitters. Real alphas train 7 days a week",
        exchanges: [
            {
                playerReply: "Rest days are literally when your muscles grow",
                opponentResponse: "Nah bro that's what protein shakes are for"
            },
            {
                playerReply: "That's not how biology works",
                opponentResponse: "I've gained 20 pounds of pure muscle this month"
            },
            {
                playerReply: "Your joints are screaming and you can't hear them",
                opponentResponse: "why does my shoulder keep popping is that normal"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'lifestyle_5',
        category: 'lifestyle',
        opponent: {
            name: 'KetoKaren',
            icon: '🥑',
            handle: '@carbsareevil'
        },
        openingTweet: "A single carb will destroy your metabolism forever. FACTS.",
        exchanges: [
            {
                playerReply: "Humans have literally eaten bread for 10,000 years",
                opponentResponse: "Yeah and look how unhealthy ancient people were"
            },
            {
                playerReply: "They died from plague not sourdough",
                opponentResponse: "Bread causes inflammation which causes everything"
            },
            {
                playerReply: "You're eating 3000 calories of butter a day Karen",
                opponentResponse: "ok but why am I gaining weight if carbs are the problem"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'lifestyle_6',
        category: 'lifestyle',
        opponent: {
            name: 'AdultingExpert',
            icon: '👔',
            handle: '@realgrowup'
        },
        openingTweet: "If you still play video games after 25 you need to grow up",
        exchanges: [
            {
                playerReply: "The average gamer is 34 years old but go off",
                opponentResponse: "Those people are avoiding real responsibilities"
            },
            {
                playerReply: "Like you avoid fun?",
                opponentResponse: "I have mature hobbies like watching TV and scrolling"
            },
            {
                playerReply: "That's literally worse than gaming",
                opponentResponse: "...wait is it? I just watch other people play games"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'lifestyle_7',
        category: 'lifestyle',
        opponent: {
            name: 'ProductivityPro',
            icon: '📊',
            handle: '@optimizethis'
        },
        openingTweet: "If you're not tracking every minute of your day you're wasting time",
        exchanges: [
            {
                playerReply: "Tracking time is also using time though",
                opponentResponse: "I spend 47 minutes daily optimizing my 16-hour schedule"
            },
            {
                playerReply: "That's almost an hour you could've just... lived",
                opponentResponse: "But now I have data and graphs and spreadsheets"
            },
            {
                playerReply: "Do you have joy?",
                opponentResponse: "I scheduled joy for Thursday but I'm not looking forward to it"
            }
        ],
        difficulty: 'hard'
    },
    {
        id: 'lifestyle_8',
        category: 'lifestyle',
        opponent: {
            name: 'HustleCulture',
            icon: '💼',
            handle: '@sidehustleking'
        },
        openingTweet: "Everyone should have 3-5 side hustles minimum in 2025",
        exchanges: [
            {
                playerReply: "Or one job that pays a living wage?",
                opponentResponse: "That's poor people mentality. I run 7 businesses"
            },
            {
                playerReply: "Seven failing dropshipping stores isn't seven businesses",
                opponentResponse: "They're in growth mode okay it takes time"
            },
            {
                playerReply: "It's been four years",
                opponentResponse: "my mom wants me to get a real job but that's giving up right"
            }
        ],
        difficulty: 'medium'
    },
    {
        id: 'lifestyle_9',
        category: 'lifestyle',
        opponent: {
            name: 'MorningPerson',
            icon: '🌅',
            handle: '@riseandshine'
        },
        openingTweet: "Night owls are just lazy. Morning people are scientifically superior",
        exchanges: [
            {
                playerReply: "Circadian rhythms are genetic not a personality trait",
                opponentResponse: "Excuses. Winners choose to wake up early"
            },
            {
                playerReply: "You literally fall asleep at 8pm every night",
                opponentResponse: "Because I've already accomplished more than you all day"
            },
            {
                playerReply: "You missed your best friend's birthday dinner",
                opponentResponse: "...yeah that was bad. she's still not talking to me"
            }
        ],
        difficulty: 'easy'
    },
    {
        id: 'lifestyle_10',
        category: 'lifestyle',
        opponent: {
            name: 'MealPrepMaster',
            icon: '🥗',
            handle: '@containerlife'
        },
        openingTweet: "If you don't meal prep you're wasting money and have no discipline",
        exchanges: [
            {
                playerReply: "Some of us like food that doesn't taste like plastic",
                opponentResponse: "My chicken and rice tastes fine after 6 days"
            },
            {
                playerReply: "That's literally food poisoning waiting to happen",
                opponentResponse: "I freeze half of it. Very safe and efficient"
            },
            {
                playerReply: "You ate freezer-burned broccoli for lunch today didn't you",
                opponentResponse: "I actually threw up. might start cooking daily"
            }
        ],
        difficulty: 'medium'
    }
];

/**
 * Get a random bickering conversation
 * @param {string} category - Optional category filter ('tech', 'popculture', 'internet', 'lifestyle')
 * @returns {Object} A random conversation object
 */
export function getRandomConversation(category = null) {
    let pool = BICKERING_CONVERSATIONS;
    if (category) {
        const filtered = BICKERING_CONVERSATIONS.filter(c => c.category === category);
        // Fall back to full pool if no matches for the category
        if (filtered.length > 0) {
            pool = filtered;
        }
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get conversations by difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Array} Conversations matching the difficulty
 */
export function getConversationsByDifficulty(difficulty) {
    return BICKERING_CONVERSATIONS.filter(c => c.difficulty === difficulty);
}
