import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { BarChart3, ExternalLink, Pencil, User as UserIcon, X, Upload, Image as ImageIcon, Trash2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import { JSColorPicker } from "@/components/JSColorPicker"
import type { Survey, User } from "./DashboardAction"


type Props = {
  surveys: Survey[]
  user: User | null
  onLogout: () => void
  onToggleActive: (survey: Survey) => void
  onCopyVoteLink: (accessCode: string) => void
  onUpdateUser: (formData: FormData) => Promise<boolean>
}

export default function DashboardView({
  surveys,
  user,
  onLogout,
  onToggleActive,
  onCopyVoteLink,
  onUpdateUser,
}: Props) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  const dynamicBackgroundStyle = useMemo(() => {
    if (!user) {
      return { background: '#f8fafc' }
    }

    if (user.background_image) {
      return {
        backgroundImage: `url(${user.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }
    }

    const c1 = user.color_1 || '#f8fafc'
    const c2 = user.color_2 || '#eef2ff'
    const c3 = user.color_3 || '#F3F4F6'

    return {
      background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`,
      minHeight: '100vh',
      transition: 'background 0.5s ease-in-out'
    }
  }, [user])


  return (
    <div
      className="min-h-screen p-6 md:p-10 font-sans"
      style={dynamicBackgroundStyle}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center border border-white/20">
          <div className="flex items-center gap-4">
            {/* Avatar Usera */}
            <div
              className="w-32 h-32 border-indigo-500 rounded-lg overflow-hidden border-2 shadow-sm bg-gray-200 flex items-center justify-center flex-shrink-0"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div>
              <h1
                className="text-3xl font-bold text-gray-800"
              >
                Witaj, {user?.username || "Użytkowniku"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">Panel zarządzania ankietami</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-gray-200 transition-all flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edytuj Profil
            </button>

            <Link
              to="/surveys/create"
              className="cursor-pointer text-white px-4 py-2 rounded-lg bg-indigo-700 font-bold shadow-md hover:shadow-lg transition-all"
            >
              Utwórz ankietę
            </Link>

            <button
              onClick={onLogout}
              className="cursor-pointer flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Twoje Ankiety</h2>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
            Liczba: {surveys.length}
          </span>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">Brak ankiet. Utwórz pierwsza w kreatorze.</p>
            <Link
              to="/surveys/create"
              className="mt-4 inline-flex px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
            >
              Otwórz kreator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{survey.title}</h3>
                    <p className="text-gray-500 text-sm">{survey.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onToggleActive(survey)}
                      className={`
                        cursor-pointer px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors
                        ${survey.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                          : "bg-gray-200 text-gray-500 hover:bg-gray-300 border border-gray-300"
                        }
                      `}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${survey.is_active ? "bg-green-500 animate-pulse" : "bg-gray-400"
                          }`}
                      ></span>
                      {survey.is_active ? "Opublikowana" : "Szkic"}
                    </button>
                    <span className="text-xs text-gray-400 font-mono">ID: {survey.id}</span>
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <h4 className="font-semibold text-xs text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    Pytania
                  </h4>

                  {survey.questions.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-400 italic text-sm">Brak pytan</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {survey.questions.map((q, idx) => (
                        <div key={q.id} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                          <p className="font-semibold text-gray-800 text-sm mb-2">
                            {idx + 1}. {q.question_text}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {q.choices.map((c) => (
                              <span
                                key={c.id}
                                className="text-xs font-medium bg-white px-3 py-1.5 rounded-lg text-indigo-600 border border-indigo-100 shadow-sm flex items-center gap-2"
                              >
                                {c.choice_text}
                                <span className="bg-indigo-100 text-indigo-800 px-1.5 rounded text-[10px] font-bold">
                                  {c.votes}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-gray-500 text-sm overflow-hidden">
                    <button
                      type="button"
                      className="hover:bg-indigo-600 rounded-full hover:text-white px-2 py-1 transition-colors"
                      onClick={() => onCopyVoteLink(survey.access_code)}
                      title="Kopiuj link do glosowania"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </button>
                    <span className="break-all font-mono text-xs">/vote/{survey.access_code}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/surveys/${survey.id}/results`}
                      state={{ survey }}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full p-2 transition-colors"
                      title="Zobacz wyniki ankiety"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="sr-only">Wyniki</span>
                    </Link>
                    <Link
                      to={`/surveys/${survey.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full p-2 transition-colors"
                      title="Edytuj ankiete"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edytuj</span>
                    </Link>
                    <Link
                      to={`/vote/${survey.access_code}`}
                      target="_blank"
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full p-2 transition-colors"
                      title="Otworz glosowanie"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Otworz glosowanie</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isEditProfileOpen && user && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditProfileOpen(false)}
          onSubmit={onUpdateUser}
        />
      )}
    </div>
  )
}

function EditProfileModal({ user, onClose, onSubmit }: { user: User, onClose: () => void, onSubmit: (fd: FormData) => Promise<boolean> }) {
  const [color1, setColor1] = useState(user.color_1 || "#f8fafc")
  const [color2, setColor2] = useState(user.color_2 || "#eef2ff")
  const [color3, setColor3] = useState(user.color_3 || "#F3F4F6")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar)
  const [bgPreview, setBgPreview] = useState<string | null>(user.background_image)

  const [deleteAvatar, setDeleteAvatar] = useState(false)
  const [deleteBg, setDeleteBg] = useState(false)
  const [bgFile, setBgFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (type === 'avatar') {
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
        setDeleteAvatar(false)
      } else {
        setBgFile(file)
        setBgPreview(URL.createObjectURL(file))
        setDeleteBg(false)
      }
    }
  }

  const handleRemove = (type: 'avatar' | 'bg') => {
    if (type === 'avatar') {
      setAvatarFile(null)
      setAvatarPreview(null)
      setDeleteAvatar(true)
    } else {
      setBgFile(null)
      setBgPreview(null)
      setDeleteBg(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('color_1', color1)
    formData.append('color_2', color2)
    formData.append('color_3', color3)

    if (deleteAvatar) {
      formData.append('delete_avatar', 'true')
    } else if (avatarFile) {
      formData.append('avatar', avatarFile)
    }

    if (deleteBg) {
      formData.append('delete_background_image', 'true')
    } else if (bgFile) {
      formData.append('background_image', bgFile)
    }

    const success = await onSubmit(formData)
    if (success) onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]">

        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Edytuj Wygląd</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">

          {/* Sekcja Obrazków */}
          <div className="grid grid-cols-2 gap-4">
            {/* AVATAR */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Avatar</label>
                {avatarPreview && (
                  <button type="button" onClick={() => handleRemove('avatar')} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <Trash2 size={12} /> Usuń
                  </button>
                )}
              </div>
              <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-2 hover:border-indigo-500 transition-colors text-center h-32 flex flex-col items-center justify-center overflow-hidden bg-gray-50">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <UserIcon size={24} />
                    <span className="text-xs mt-1">Brak</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <Upload className="text-white" size={20} />
                </div>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'avatar')} />
              </div>
            </div>

            {/* TŁO */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Tło</label>
                {bgPreview && (
                  <button type="button" onClick={() => handleRemove('bg')} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <Trash2 size={12} /> Usuń
                  </button>
                )}
              </div>
              <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-2 hover:border-indigo-500 transition-colors text-center h-32 flex flex-col items-center justify-center overflow-hidden bg-gray-50">
                {bgPreview ? (
                  <img src={bgPreview} alt="Bg Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon size={24} />
                    <span className="text-xs mt-1">Brak (Gradient)</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <Upload className="text-white" size={20} />
                </div>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'bg')} />
              </div>
            </div>
          </div>

          {/* Sekcja Kolorów */}
          <div className="space-y-3 pt-4 pb-6 border-b border-gray-100">
            <Label>Kolorystyka ankiety</Label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Kolor 1 (Góra-Lewo)</Label>
                <div className="w-full">
                  <JSColorPicker
                    value={color1}
                    onChange={(c) => setColor1(c)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Kolor 2 (Środek)</Label>
                <div className="w-full">
                  <JSColorPicker
                    value={color2}
                    onChange={(c) => setColor2(c)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Kolor 3 (Dół-Prawo)</Label>
                <div className="w-full">
                  <JSColorPicker
                    value={color3}
                    onChange={(c) => setColor3(c)}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Zapisywanie..." : "Zapisz Zmiany"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
