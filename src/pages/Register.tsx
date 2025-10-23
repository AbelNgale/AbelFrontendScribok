// // src/pages/Register.jsx
// import React, { useState } from "react";
// import { register } from "../services/auth";
// import { useNavigate } from "react-router-dom";

// const Register = () => {
//   const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await register(email, username, password);
//       alert("Registrado com sucesso. Faz login.");
//       navigate("/login");
//     } catch (err) {
//       const data = err.response?.data || err.message;
//       alert("Erro no registro: " + JSON.stringify(data));
//     }
//   };

//   return (
//     <div>
//       <h2>Registo</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
//         <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
//         <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
//         <button type="submit">Registrar</button>
//       </form>
//     </div>
//   );
// };

// export default Register;
