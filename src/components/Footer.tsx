import { GitHub as GitHubIcon } from "@mui/icons-material"
import "./Footer.css"

function Footer() {
    const sourceCodeUrl = "https://github.com/uwla/repo_stars_organizer"

    return (
        <footer>
            <GitHubIcon />
            <a href={sourceCodeUrl}>CODE</a>
        </footer>
    )
}

export default Footer
