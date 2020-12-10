export function getGameData (game: any) {
    const { user } = game;
    return {
        game_uid: game.uid,
        official: game.official,
        title: game.title,
        pathname: game.pathname,
        version: game.version,
        control_type: game.control_type,
        hashtags: game.hashtags,
        count_over: game.count_over,
        url_game: game.url_game,
        url_thumb: game.url_thumb,
        // share_url: user? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
        user: user? {
            uid: user.uid,
            name: user.name,
            picture: user.picture,
            channel_id: user.channel_id,
        } : null
    }
}
