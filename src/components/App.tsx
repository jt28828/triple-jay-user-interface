import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.scss';
import Scorecards from "./dashboard/scores/score-cards/ScoreCards";
import Login from "./login/login/Login";
import LatestSongs from "./dashboard/latest-songs/LatestSongs";
import { WebsocketService } from "../services/websocket-service";
import Header from "./shared/header/Header";
import { Page } from "../models/enums/page";
import Management from "./management/Management";
import { Http } from "../utilities/http";
import { leaderboardUrl, songUrl } from "../models/constants/urls";
import { PlayedSong } from "../models/dto/played-song";
import { LeaderboardUser } from "../models/dto/leaderboard-user";
import DrinkingGame from "./shared/drinking-game/DrinkingGame";
import { DrinkingGameDto } from "../models/dto/drinking-game";

const App: React.FC = () => {
    let drinkingGameTimeout: number | null;
    const [users, setUsers] = useState([] as ReadonlyArray<LeaderboardUser>);
    const [songs, setSongs] = useState([] as ReadonlyArray<PlayedSong>);
    const [drinkingGame, setDrinkingGame] = useState(null as DrinkingGameDto | null);

    useEffect(() => {
        console.log(drinkingGame);
        const webSockets = new WebsocketService();
        webSockets.leaderboardChangeUpdate.subscribe(() => loadPageData());
        webSockets.drinkingGameUpdate.subscribe(val => updateVisibleDrinkingGame(val));
        loadPageData();
    }, []);

    /** Requests the 10 last played songs */
    async function requestSonglist() {
        let songs = await Http.get<PlayedSong[]>(songUrl);

        if (songs == null) {
            songs = [];
        }

        setSongs(songs);
    }

    async function requestLeaderboard() {
        let users = await Http.get<LeaderboardUser[]>(leaderboardUrl);

        if (users == null) {
            users = [];
        }

        setUsers(users);
    }

    async function loadPageData() {
        requestSonglist();
        requestLeaderboard();
    }

    function updateVisibleDrinkingGame(game: DrinkingGameDto) {
        if (drinkingGameTimeout != null) {
            // Cancel the current timeout
            window.clearTimeout(drinkingGameTimeout);
        }
        setDrinkingGame(game);

        // Hide it again after 30 seconds
        drinkingGameTimeout = window.setTimeout(() => setDrinkingGame(null), 30000);
    }

    return (
        <Router>
            <Switch>
                <Route path="/login">
                    <Login/>
                </Route>
                <Route path="/manage">
                    <Management/>
                </Route>
                <Route path="/">
                    <div className="App">
                        <div className="content">
                            <div className="grid-item header-container">
                                <Header page={Page.dashboard}/>
                            </div>
                            <div className="grid-item user-container">
                                <Scorecards users={users}/>
                                {drinkingGame != null ?
                                    <DrinkingGame game={drinkingGame}/> :
                                    ""
                                }
                            </div>
                            <div className="grid-item latest-songs-container">
                                <LatestSongs songs={songs}/>
                            </div>
                        </div>
                    </div>
                </Route>
            </Switch>
        </Router>
    );
};

export default App;
