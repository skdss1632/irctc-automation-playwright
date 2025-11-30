export default function Credentials({ formData, updateFormData }) {
    return (
        <div className="grid md:grid-cols-3 gap-6 mb-10 p-8 bg-gradient-to-r from-gray-800/50 to-pink-900/30 rounded-3xl border border-pink-500/30">
            <input
                className="w-full p-4 bg-black/60 border-2 border-pink-500/50 rounded-2xl focus:border-pink-400 text-white placeholder-gray-400"
                placeholder="Username"
                value={formData.USERNAME}
                onChange={e => updateFormData('USERNAME', e.target.value)}
            />

            <input
                type="password"
                className="w-full p-4 bg-black/60 border-2 border-pink-500/50 rounded-2xl focus:border-pink-400 text-white placeholder-gray-400"
                placeholder="Password"
                value={formData.PASSWORD}
                onChange={e => updateFormData('PASSWORD', e.target.value)}
            />

            <label className="flex items-center gap-3 p-4 bg-green-900/40 border-2 border-green-500/60 rounded-2xl">
                <input
                    type="checkbox"
                    checked={formData.AUTOCAPTCHA}
                    onChange={e => updateFormData('AUTOCAPTCHA', e.target.checked)}
                    className="w-5 h-5"
                />
                <span className="font-semibold text-green-200">Auto captcha</span>
            </label>
        </div>
    );
}
