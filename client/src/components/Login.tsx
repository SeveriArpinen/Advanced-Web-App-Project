import { useState } from 'react'

// fetches the user, if found with a token, stores it into localstorage, directs user to /documents page
const fetchData = async (email: string, password: string) => {
    try {
        const response = await fetch("/api/user/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })



        const data = await response.json()

        if (!response.ok) {
            alert(data.message || "Error! please try again")
            return
        }

        if(data.token) {
            localStorage.setItem("token", data.token)
            localStorage.setItem("userEmail", email)
            window.location.href = "/documents"
        }

    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error when trying to login: ${error.message}`)
            alert("Error logging in, please try again!")
        }
    }


}


const Login = () => {

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card-body">
                        <h1 className="card-title text-center mb-5">Login</h1>
                        <form>
                            <div className="mb-2">
                                <input className="form-control" 
                                type="email" placeholder='email' value={email}
                                onChange={(e) => setEmail(e.target.value)} required/>
                            </div>

                            <div className="mb-4">
                                <input className="form-control" 
                                type="password" placeholder="password" value={password}
                                onChange={(e) => setPassword(e.target.value)} required/>
                            </div>

                            <button type="button" className="btn btn-primary mb-4"
                            onClick={() => fetchData(email, password)}>LOGIN!</button>
                        </form>
                        <p className="text-center">
                            If you dont have an account yet, register <a href="/register"> here! </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
