import PassengerForm from './PassengerForm';

export default function Travellers({
    passengers,
    addPassenger,
    removePassenger,
    startEditPassenger,
    editingIndex,
    editingPassenger,
    setEditingPassenger,
    savePassenger,
    cancelEditPassenger,
}) {
    return (
        <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Passengers ({passengers.length}/4)</h2>
                <button
                    onClick={addPassenger}
                    disabled={passengers.length >= 4}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold"
                >
                    Add passenger
                </button>
            </div>

            <div className="space-y-4 mb-8">
                {passengers.map((p, i) => (
                    <PassengerForm
                        key={i}
                        passenger={p}
                        index={i}
                        onEdit={() => startEditPassenger(i)}
                        onDelete={() => removePassenger(i)}
                    />
                ))}
            </div>

            {editingIndex !== null && (
                <div className="p-6 bg-gray-800 rounded-3xl border border-blue-500/60">
                    <h3 className="text-xl font-semibold mb-4">
                        {editingIndex < passengers.length ? 'Edit passenger' : 'Add passenger'}
                    </h3>
                    <div className="grid md:grid-cols-5 gap-4 mb-4">
                        <input
                            className="p-3 bg-black/60 border border-blue-500/40 rounded-xl text-white placeholder-gray-400"
                            placeholder="Name"
                            value={editingPassenger.NAME}
                            onChange={e =>
                                setEditingPassenger(prev => ({ ...prev, NAME: e.target.value }))
                            }
                        />
                        <input
                            type="number"
                            className="p-3 bg-black/60 border border-blue-500/40 rounded-xl text-white placeholder-gray-400"
                            placeholder="Age"
                            value={editingPassenger.AGE}
                            onChange={e =>
                                setEditingPassenger(prev => ({ ...prev, AGE: e.target.value }))
                            }
                        />
                        <select
                            className="p-3 bg-black/60 border border-blue-500/40 rounded-xl text-white"
                            value={editingPassenger.GENDER}
                            onChange={e =>
                                setEditingPassenger(prev => ({ ...prev, GENDER: e.target.value }))
                            }
                        >
                            <option className="text-black">Male</option>
                            <option className="text-black">Female</option>
                            <option className="text-black">Transgender</option>
                        </select>
                        <select
                            className="p-3 bg-black/60 border border-blue-500/40 rounded-xl text-white"
                            value={editingPassenger.SEAT}
                            onChange={e =>
                                setEditingPassenger(prev => ({ ...prev, SEAT: e.target.value }))
                            }
                        >
                            {[
                                'Lower',
                                'Middle',
                                'Upper',
                                'Side Lower',
                                'Side Upper',
                                'Window Side',
                                'No Preference',
                            ].map(s => (
                                <option key={s} className="text-black">
                                    {s}
                                </option>
                            ))}
                        </select>
                        <select
                            className="p-3 bg-black/60 border border-blue-500/40 rounded-xl text-white"
                            value={editingPassenger.FOOD}
                            onChange={e =>
                                setEditingPassenger(prev => ({ ...prev, FOOD: e.target.value }))
                            }
                        >
                            {['Veg', 'Non Veg', 'No Food'].map(f => (
                                <option key={f} className="text-black">
                                    {f}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={savePassenger}
                            className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-xl font-semibold"
                        >
                            Save
                        </button>
                        <button
                            onClick={cancelEditPassenger}
                            className="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
