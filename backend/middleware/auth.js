// import jwt from "jsonwebtoken";

// export default function auth(req, res, next) {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.sendStatus(401);
//   try {
//     req.user = jwt.verify(token, "FOS_SECRET");
//     next();
//   } catch {
//     res.sendStatus(401);
//   }
// }


import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, "FOS_SECRET");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
