export type CronState = {
    interval: number
    status: "playing" | "stopped"
}

export let cronState: CronState = {
    interval: 10 * 60 * 1000, // 10m
    status: "stopped",
}

export const updateCronState = (state: CronState) => {
    cronState = state
}
