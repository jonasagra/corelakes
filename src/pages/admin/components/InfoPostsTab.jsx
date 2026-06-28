export default function InfoPostsTab({ posts, lastDate, onEdit, onDelete }) {
  return (
    <>
      <div className="mc-panel p-5 mb-[30px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-mc-five text-base text-mc-green-light">Total de Posts</h3>
            <p className="font-mc text-[1.6rem] text-white">{posts.length}</p>
          </div>
          <div className="flex items-center justify-between gap-4 border-t-2 border-mc-dark pt-3">
            <h3 className="font-mc-five text-base text-mc-green-light">Ultimo Post</h3>
            <p className="font-mc text-[1rem] text-white text-right break-words max-w-[220px]">
              {lastDate}
            </p>
          </div>
        </div>
      </div>

      <div className="mc-panel p-[25px]">
        <h2 className="font-mc-five text-[1.3rem] text-white mb-5" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
          Posts Publicados
        </h2>

        {posts.length === 0 ? (
          <p className="font-mc text-[0.9rem] text-white/50 text-center py-[40px]">Nenhum post publicado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Titulo/Data', 'Ações'].map(h => (
                    <th key={h} className="px-1 py-3 text-center font-mc text-[0.8rem] text-mc-green-light border-b-2 border-mc-dark"
                        style={{ background: '#313233' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id} className="hover:bg-mc-green/10 transition-colors">
                    <td className="px-2 py-3 text-left font-mc text-[0.8rem] text-white border-b-2 border-mc-dark max-w-[360px] sm:max-w-[220px]">
                      <div className="w-full truncate">{p.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-white/60 text-[0.75rem] md:hidden">
                        <img src="https://minecraft.wiki/images/archive/20181112133323%21Calendar_sheet.png?ec376&format=original" alt="Data" className="oreUI-icon" />
                        {p.date}
                      </div>
                    </td>
                    <td className="px-1 py-3 text-center border-b-2 border-mc-dark">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => onEdit(p)} aria-label="Editar"
                          className="flex items-center justify-center w-9 h-9 border border-black bg-[#2a2a2b] hover:bg-mc-green transition-colors cursor-pointer">
                          <img src="https://minecraft.wiki/images/Brush_JE1_BE1.png?fd417" alt="" aria-hidden="true" className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(p.id)} aria-label="Excluir"
                          className="flex items-center justify-center w-9 h-9 border border-black bg-[#2a2a2b] hover:bg-mc-red transition-colors cursor-pointer">
                          <img src="https://minecraft.wiki/images/Lava_Bucket_JE2_BE2.png?55ee0&format=original" alt="" aria-hidden="true" className="w-5 h-5" />
                        </button>
                        <a href={`/post/${p.slug}`} target="_blank" rel="noreferrer" aria-label="Visualizar"
                           className="flex items-center justify-center w-9 h-9 border border-black bg-[#2a2a2b] hover:bg-mc-green transition-colors no-underline">
                          <img src="https://minecraft.wiki/images/Night_Vision_JE1_BE1.png?92706&format=original" alt="" aria-hidden="true" className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
