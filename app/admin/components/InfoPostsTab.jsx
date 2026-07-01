export default function InfoPostsTab({ posts, lastDate, onEdit, onDelete }) {
  return (
    <section className="mc-panel p-[25px] mb-[30px]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-[18px]">
        <div>
          <h2 className="font-mc-five text-[1.2rem] text-white" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>Posts públicos</h2>
          <p className="font-mc text-[0.8rem] text-white/50 mt-[6px]">Último post publicado: {lastDate}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="border-b border-[#2a2a2b]">
              <th className="py-3 pr-3">Título</th>
              <th className="py-3 pr-3">Slug</th>
              <th className="py-3 pr-3">Data</th>
              <th className="py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-[#242424]">
                <td className="py-3 pr-3">{post.title}</td>
                <td className="py-3 pr-3">{post.slug}</td>
                <td className="py-3 pr-3">{post.date}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="mc-btn" onClick={() => onEdit(post)}>Editar</button>
                    <button className="mc-btn mc-btn-danger" onClick={() => onDelete(post.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
