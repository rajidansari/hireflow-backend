import { validateAccessToken } from '../utils/jwt.utils.js';

function auth(req, res, next) {
  try {
		const accessToken = req.headers?.['authorization']?.split(' ')[1];
		
		  if (!accessToken) {
		    return res.status(401).json({ message: 'Unauthorized access denied' });
		  }
		
		  const decoded = validateAccessToken(accessToken);
			if(!decoded) {
				return res.status(403).json({message: "Invalid token"});
			}
		
			req.user = decoded;
		
			next();
	} catch (err) {
		console.error(`Auth middleware failed :: ${err}`);
		if(err.name === "JsonWebTokenError") {
			return res.status(401).json({message: "Invalid token"})
		}
		if(err.name === "TokenExpiredError") {
			return res.status(401).json({message: "Token expired"});
		}
		res.status(500).json({message: "Internal server error"})
	}

}


export default auth;