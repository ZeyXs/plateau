const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const token =
            req.headers.authorization &&
            req.headers.authorization.split(' ')[1];

        if (!token) return res.sendStatus(401);

        // Verify and decode the token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            console.log(decoded);
            if (err) return res.sendStatus(403); // Invalid token

            const roles = decoded.UserInfo.roles;

            if (!roles) return res.sendStatus(401);
            const rolesArray = [...allowedRoles];
            console.log(rolesArray);
            console.log(roles);
            const result = roles
                .map(role => rolesArray.includes(role))
                .find(val => val === true);
            if (!result) return res.sendStatus(401);

            next();
        });
    };
};

module.exports = verifyRoles;
