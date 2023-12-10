import _ from 'lodash';
import db from 'data/db.json';

export function getStatuses() {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve(['FINISHED', 'ONGOING', 'UPCOMING', 'UNKNOWN'])
        }, 1000)
    })
}

export function getTypes() {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'UNKNOWN'])
        }, 1000)
    })
}

export function getNewest(offset, size, params = { type: undefined, status: undefined }) {
    function buildFilter(anime) {
        if (params.type && params.status) {
            return _.includes(params.type, anime.type) || _.includes(params.status, anime.status)
        } if (params.type) {
            return _.includes(params.type, anime.type)
        } if (params.status) {
            return _.includes(params.status, anime.status)
        }
        return anime

    }

    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve({
                data: db.data
                    .filter(anime => anime.animeSeason.year === 2023 && anime.animeSeason.season === "FALL")
                    .filter(anime => !_.includes(anime.tags, 'hentai'))
                    .filter(anime => buildFilter(anime))
                    .slice((offset - 1) * size, ((offset - 1) * size) + size),
                total: db.data
                    .filter(anime => anime.animeSeason.year === 2023 && anime.animeSeason.season === "FALL")
                    .filter(anime => !_.includes(anime.tags, 'hentai'))
                    .filter(anime => buildFilter(anime))
                    .length
            })
        }, 1000)
    })
}