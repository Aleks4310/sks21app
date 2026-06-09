const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }
        next();
    };
};

module.exports = roleCheck;
