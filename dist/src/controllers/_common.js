"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameData = void 0;
function getGameData(game) {
    const { user } = game;
    return {
        id: game.id,
        official: game.official,
        category: game.category,
        title: game.title,
        description: game.description,
        pathname: game.pathname,
        version: game.version,
        control_type: game.control_type,
        hashtags: game.hashtags,
        count_over: game.count_over,
        count_heart: game.count_heart,
        url_game: game.url_game,
        url_thumb: game.url_thumb,
        url_thumb_webp: game.url_thumb_webp,
        url_thumb_gif: game.url_thumb_gif,
        // share_url: user? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
        user: user ? {
            uid: user.uid,
            name: user.name,
            picture: user.picture,
            channel_id: user.channel_id,
        } : undefined
    };
}
exports.getGameData = getGameData;
//# sourceMappingURL=_common.js.map