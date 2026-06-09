const rateLimit = (maxRequests = 100, windowMs = 60000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const key = req.userId || req.ip;
        const now = Date.now();
        
        if (!requests.has(key)) {
            requests.set(key, []);
        }
        
        const userRequests = requests.get(key);
        const recentRequests = userRequests.filter(time => now - time < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({ error: 'Слишком много запросов' });
        }
        
        recentRequests.push(now);
        requests.set(key, recentRequests);
        next();
    };
};

module.exports = rateLimit;
