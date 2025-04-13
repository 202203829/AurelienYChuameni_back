const Navbar = () => {
    return (
        <header>
            <div className="menu">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
                <div className="right">
                    <a href="/login">Login</a>
                    <a href="/signup">Sign Up</a>
                </div>
            </div>
        </header>
    );
};
