import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
    return (
        <nav className="navbar mt-4 mr-4 ml-4">
            <div className="grow text-2xl font-bold text-gray-800">SpaceVote</div>
            <div>
                <ConnectButton />
            </div>
        </nav>
    )
}

export default Header;