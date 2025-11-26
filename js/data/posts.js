/**
 * Post Content Library
 * Fake X posts for the typing game
 */

export const POSTS = [
    // Short posts (beginner friendly)
    { text: "good morning", category: "relatable", followerMult: 1, impressionMult: 1 },
    { text: "lol same", category: "relatable", followerMult: 1, impressionMult: 1 },
    { text: "this is fine", category: "shitpost", followerMult: 1, impressionMult: 1.2 },
    { text: "ratio", category: "ratio", followerMult: 0.8, impressionMult: 2 },
    { text: "real", category: "relatable", followerMult: 1, impressionMult: 1 },
    { text: "based", category: "shitpost", followerMult: 1, impressionMult: 1.2 },
    { text: "L take", category: "ratio", followerMult: 0.8, impressionMult: 2 },
    { text: "touch grass", category: "shitpost", followerMult: 1, impressionMult: 1.5 },

    // Medium posts
    { text: "good morning to everyone except people who still call it Twitter", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "normalize not responding to DMs for 3-5 business days", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "POV: You said you'd go to bed early but you're doom scrolling at 3am", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "Unpopular opinion: the algorithm actually knows me too well", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "this post will get 10M impressions and I'll earn $3.50", category: "shitpost", followerMult: 1, impressionMult: 2 },
    { text: "ratio + L + you fell off + Grok could write better", category: "ratio", followerMult: 0.8, impressionMult: 2.5 },
    { text: "we need to talk about the main character of the day", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "me: I should save money. also me: new phone dropped", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "just had the most unhinged experience at the grocery store", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "normalize logging off when you're getting too heated", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "the internet was a mistake and I love it here", category: "shitpost", followerMult: 1.1, impressionMult: 1.5 },
    { text: "main character energy but make it unhinged", category: "shitpost", followerMult: 1.1, impressionMult: 1.5 },

    // Longer posts
    { text: "starting to think my For You page is just a psychological experiment", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "broke: going to therapy. woke: posting through it on X dot com", category: "shitpost", followerMult: 1.1, impressionMult: 1.8 },
    { text: "can we normalize just saying no to plans without making up excuses", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "the LinkedIn to X pipeline is actually insane right now and I'm here for it", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "genuinely cannot tell if this take is satire anymore and that scares me", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "my screen time report just came out and I need to have a conversation with myself", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "hot take: most hot takes are actually just common sense with better marketing", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "just saw someone get community noted in real time and it was beautiful", category: "shitpost", followerMult: 1.1, impressionMult: 1.8 },
    { text: "normalize admitting you were wrong on the internet without deleting the post", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "me refreshing my mentions after posting something mildly controversial", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },

    // Hot takes
    { text: "unpopular opinion: most unpopular opinions are actually very popular", category: "hottake", followerMult: 1.4, impressionMult: 1.6 },
    { text: "controversial take but I think sleep is actually good for you", category: "shitpost", followerMult: 1.1, impressionMult: 1.5 },
    { text: "hot take: touching grass is overrated when the vibes online are this good", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "controversial opinion: water is actually pretty essential for survival", category: "shitpost", followerMult: 1.1, impressionMult: 1.5 },
    { text: "the algorithm really said you're gonna see this whether you like it or not", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "everyone has main character syndrome and honestly that's fine", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },

    // Engagement bait
    { text: "repost if you've ever existed on the internet", category: "engagement", followerMult: 0.9, impressionMult: 3 },
    { text: "like if you agree, repost if you strongly agree", category: "engagement", followerMult: 0.9, impressionMult: 3 },
    { text: "drop a fire emoji if you're reading this in 2024", category: "engagement", followerMult: 0.9, impressionMult: 2.5 },
    { text: "comment your most unhinged take with zero context", category: "engagement", followerMult: 1, impressionMult: 2.5 },

    // Tech/Crypto themed
    { text: "web3 is the future. no I will not elaborate further", category: "hottake", followerMult: 1.2, impressionMult: 1.5 },
    { text: "just mass adopted something. feeling good about it", category: "shitpost", followerMult: 1, impressionMult: 1.5 },
    { text: "the real metaverse was the posts we made along the way", category: "shitpost", followerMult: 1.1, impressionMult: 1.5 },
    { text: "AI will never replace the human ability to post through it", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "my portfolio looking like my mental health rn", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },

    // Self-aware meta posts
    { text: "this is my daily post to feed the algorithm. how are you all doing", category: "relatable", followerMult: 1, impressionMult: 1.5 },
    { text: "posting for engagement because I need the validation today", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "watch this get 3 likes and one of them is me from my alt", category: "shitpost", followerMult: 1.1, impressionMult: 1.5 },
    { text: "I put way too much effort into posts that get 5 impressions", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "crafting the perfect post that absolutely no one asked for", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },

    // Premium/Verification themed
    { text: "paying $8 a month for the privilege of being wrong publicly", category: "shitpost", followerMult: 1, impressionMult: 2 },
    { text: "my blue check gives me the confidence of a mediocre man", category: "shitpost", followerMult: 1, impressionMult: 2 },
    { text: "verification is just paying for the right to be ratio'd harder", category: "shitpost", followerMult: 1, impressionMult: 2 },
    { text: "finally verified and I still have nothing important to say", category: "relatable", followerMult: 1.2, impressionMult: 1.5 },

    // Long form posts
    { text: "thread incoming: why I think the internet has fundamentally changed how we communicate (1/47)", category: "longform", followerMult: 1.5, impressionMult: 2 },
    { text: "okay let me explain why this take is actually correct and you're all missing the point", category: "longform", followerMult: 1.4, impressionMult: 1.8 },
    { text: "I've been thinking about this for a while and I need to share my unfiltered thoughts", category: "longform", followerMult: 1.4, impressionMult: 1.8 },
    { text: "since everyone is being wrong about this topic let me clear things up real quick", category: "hottake", followerMult: 1.4, impressionMult: 1.6 },

    // Longer X-style posts
    { text: "just had the wildest uber ride of my life and honestly I'm still processing what happened", category: "relatable", followerMult: 1.3, impressionMult: 1.5 },
    { text: "the way some of you act on this app is genuinely concerning and I say that with love", category: "hottake", followerMult: 1.4, impressionMult: 1.8 },
    { text: "every time I think about deleting this app I see something that makes me stay for another week", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "normalize telling people their take was bad instead of just subtweeting about it for three days", category: "hottake", followerMult: 1.4, impressionMult: 1.6 },
    { text: "the difference between a good day and a bad day is entirely dependent on my wifi connection", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "I have so many thoughts on this topic but I know better than to share them on main", category: "relatable", followerMult: 1.2, impressionMult: 1.4 },
    { text: "someone please explain to me why we're still having this conversation in the year of our lord", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "the algorithm really said here's the same five people arguing about the same thing every day", category: "shitpost", followerMult: 1.1, impressionMult: 1.6 },
    { text: "broke: having normal conversations. woke: parasocial relationships with people who don't know you exist", category: "shitpost", followerMult: 1.2, impressionMult: 1.7 },
    { text: "my hot take is that most hot takes are just things everyone already agrees with but phrased dramatically", category: "hottake", followerMult: 1.4, impressionMult: 1.6 },
    { text: "genuinely insane that we all just collectively decided to spend our free time arguing with strangers online", category: "relatable", followerMult: 1.3, impressionMult: 1.5 },
    { text: "the real treasure was the mutuals we made along the way and also the ratio opportunities", category: "shitpost", followerMult: 1.1, impressionMult: 1.5 },
    { text: "sometimes I write a really good post and then delete it because I know it would cause too much drama", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "friendly reminder that touching grass is free and arguing with strangers online has diminishing returns", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "I'm convinced half the people on this app are just three raccoons in a trench coat pretending to have opinions", category: "shitpost", followerMult: 1.2, impressionMult: 1.8 },
    { text: "the way this app humbles you the moment you think you've finally figured out how to go viral", category: "relatable", followerMult: 1.2, impressionMult: 1.4 },
    { text: "new year new me except I'm still going to be spending an unreasonable amount of time on this app", category: "relatable", followerMult: 1.2, impressionMult: 1.3 },
    { text: "imagine explaining to someone from the 1800s that we carry supercomputers in our pockets to argue about nothing", category: "shitpost", followerMult: 1.2, impressionMult: 1.6 },
    { text: "the best part about this app is when you post something and immediately regret it but it's too late", category: "relatable", followerMult: 1.2, impressionMult: 1.4 },
    { text: "at this point my For You page is just a psychological warfare experiment and I keep coming back for more", category: "relatable", followerMult: 1.3, impressionMult: 1.5 },
    { text: "controversial opinion but I think we should normalize having normal conversations without making them into content", category: "hottake", followerMult: 1.4, impressionMult: 1.6 },
    { text: "the fact that I have to specify this is not satire shows how far we've fallen as a society", category: "hottake", followerMult: 1.3, impressionMult: 1.5 },
    { text: "every time I try to log off this app something insane happens and I get pulled right back in", category: "relatable", followerMult: 1.2, impressionMult: 1.4 },
    { text: "being online has given me trust issues because I never know if someone is being genuine or doing a bit", category: "relatable", followerMult: 1.3, impressionMult: 1.5 },
    { text: "the way we all pretend to be normal on here when we're clearly all deeply unhinged is kind of beautiful", category: "shitpost", followerMult: 1.2, impressionMult: 1.6 },
];

/**
 * Get posts by category
 */
export function getPostsByCategory(category) {
    return POSTS.filter(p => p.category === category);
}

/**
 * Get random post
 */
export function getRandomPost() {
    return POSTS[Math.floor(Math.random() * POSTS.length)];
}

/**
 * Get post by difficulty (text length)
 */
export function getPostByDifficulty(maxLength) {
    const filtered = POSTS.filter(p => p.text.length <= maxLength);
    if (filtered.length === 0) return POSTS[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
}
