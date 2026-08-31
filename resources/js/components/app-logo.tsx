export default function AppLogo() {
    return (
        <>
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
                <img
                    src="/Event%20Tracker.png"
                    alt="Event Tracker"
                    className="size-full object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Event Tracker
                </span>
            </div>
        </>
    );
}
