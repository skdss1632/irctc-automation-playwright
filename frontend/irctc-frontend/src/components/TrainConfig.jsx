const validCoaches = 'SL | 2A | 3A | 3E | 1A | CC | EC | 2S'.split(' | ');

export default function TrainConfig({ formData, updateFormData }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 p-8 bg-gradient-to-r from-gray-800/50 to-purple-900/30 rounded-3xl border border-purple-500/30">
            <input
                className="w-full p-4 bg-black/50 border-2 border-purple-500/50 rounded-2xl focus:border-purple-400 text-white placeholder-gray-400"
                placeholder="Train No (15708)"
                value={formData.TRAIN_NO}
                onChange={e => updateFormData('TRAIN_NO', e.target.value)}
            />

            <select
                className="w-full p-4 bg-black/50 border-2 border-purple-500/50 rounded-2xl focus:border-purple-400 text-white"
                value={formData.TRAIN_COACH}
                onChange={e => updateFormData('TRAIN_COACH', e.target.value)}
            >
                {validCoaches.map(c => (
                    <option key={c} value={c} className="text-black">
                        {c}
                    </option>
                ))}
            </select>

            <input
                type="date"
                className="w-full p-4 bg-black/50 border-2 border-purple-500/50 rounded-2xl focus:border-purple-400 text-white"
                value={formData.TRAVEL_DATE}
                onChange={e => updateFormData('TRAVEL_DATE', e.target.value)}
            />

            <input
                className="w-full p-4 bg-black/50 border-2 border-purple-500/50 rounded-2xl focus:border-purple-400 text-white placeholder-gray-400"
                placeholder="Source station"
                value={formData.SOURCE_STATION}
                onChange={e => updateFormData('SOURCE_STATION', e.target.value)}
            />

            <input
                className="w-full p-4 bg-black/50 border-2 border-purple-500/50 rounded-2xl focus:border-purple-400 text-white placeholder-gray-400"
                placeholder="Boarding station"
                value={formData.BOARDING_STATION}
                onChange={e => updateFormData('BOARDING_STATION', e.target.value)}
            />

            <input
                className="w-full p-4 bg-black/50 border-2 border-purple-500/50 rounded-2xl focus:border-purple-400 text-white placeholder-gray-400"
                placeholder="Destination station"
                value={formData.DESTINATION_STATION}
                onChange={e => updateFormData('DESTINATION_STATION', e.target.value)}
            />

            <label className="flex items-center gap-3 p-4 bg-yellow-900/40 border-2 border-yellow-500/60 rounded-2xl">
                <input
                    type="checkbox"
                    checked={formData.TATKAL}
                    onChange={e => updateFormData('TATKAL', e.target.checked)}
                    className="w-5 h-5"
                />
                <span className="font-semibold text-yellow-200">Tatkal</span>
            </label>

            <label className="flex items-center gap-3 p-4 bg-red-900/40 border-2 border-red-500/60 rounded-2xl">
                <input
                    type="checkbox"
                    checked={formData.PREMIUM_TATKAL}
                    onChange={e => updateFormData('PREMIUM_TATKAL', e.target.checked)}
                    className="w-5 h-5"
                />
                <span className="font-semibold text-red-200">Premium Tatkal</span>
            </label>

            <input
                className="w-full p-4 bg-black/50 border-2 border-purple-500/50 rounded-2xl focus:border-purple-400 text-white placeholder-gray-400 lg:col-span-2"
                placeholder="UPI ID (@ybl)"
                value={formData.UPI_ID_CONFIG}
                onChange={e => updateFormData('UPI_ID_CONFIG', e.target.value)}
            />
        </div>
    );
}
