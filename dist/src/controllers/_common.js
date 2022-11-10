"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameData = void 0;
function getGameData(game) {
    const { user, emotions, gameJam } = game;
    return {
        id: game.id,
        // official: game.official,
        category: game.category,
        title: game.title,
        description: game.description,
        pathname: game.pathname,
        version: game.version,
        control_type: game.control_type,
        hashtags: game.hashtags,
        stage: game.stage,
        count_over: game.count_start > game.count_over ? game.count_start : game.count_over,
        count_heart: game.count_heart,
        support_platform: game.support_platform,
        game_type: game.game_type,
        url_game: game.url_game,
        url_thumb: game.url_thumb,
        url_thumb_webp: game.url_thumb_webp,
        url_thumb_gif: game.url_thumb_gif,
        url_banner: game.url_banner,
        game_jam: gameJam ? {
            is_awarded: gameJam.is_awarded,
            jam_id: gameJam.jam_id
        } : undefined,
        // share_url: user? `${Url.Redirect}/${game.pathname}/${user.uid}` : undefined,
        user: user ? {
            id: user.id,
            uid: user.uid,
            name: user.name,
            picture: user.picture,
            channel_id: user.channel_id,
        } : undefined,
        emotions: {
            e1: (emotions === null || emotions === void 0 ? void 0 : emotions.e1) || 0,
            e2: (emotions === null || emotions === void 0 ? void 0 : emotions.e2) || 0,
            e3: (emotions === null || emotions === void 0 ? void 0 : emotions.e3) || 0,
            e4: (emotions === null || emotions === void 0 ? void 0 : emotions.e4) || 0,
            e5: (emotions === null || emotions === void 0 ? void 0 : emotions.e5) || 0,
        }
    };
}
exports.getGameData = getGameData;
//# sourceMappingURL=_common.js.map