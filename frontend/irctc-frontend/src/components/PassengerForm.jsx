export default function PassengerForm({ passenger, index, onEdit, onDelete }) {
    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800 rounded-2xl border border-blue-500/40">
            <div className="flex-1">
                <div className="font-semibold">{passenger.NAME}</div>
                <div className="text-sm text-gray-300">
                    Age {passenger.AGE} · {passenger.GENDER} · {passenger.SEAT} · {passenger.FOOD}
                </div>
            </div>
            <button
                onClick={onEdit}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-black font-semibold"
            >
                Edit
            </button>
            <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-semibold"
            >
                Delete
            </button>
        </div>
    );
}
