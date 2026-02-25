import {useState } from 'react'

// sends the post request to /register,  directs user to the login after registeration page
const fetchData = async (email: string, password: string) => {
    try {
        const response = await fetch("/api/user/register",{
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
            alert(data.error || "error registering")
            return
        }


        alert("Registeration done!")
        window.location.href = "/login"
        

    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error when trying to register: ${error.message}`)
            alert("Something went wrong, please try again")
        }
    }


}


const Register = () => {

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    return (
        
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card-body">
                        <h1 className="card-title text-center mb-5">Register</h1>
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
                            onClick={() => fetchData(email, password)}>REGISTER!</button>
                        </form>
                        <p className="text-center">
                            If you already have an account login <a href="/login"> here! </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register

