18 Coding Conventions

1. Struktur Folder (Monorepo)

/apps
  /web       (Next.js App Router)
  /server    (Node.js, Express, Socket.io)
/packages
  /shared    (Tipe TypeScript, Interface, Algoritma CardGen yang di-share)


2. Gaya Kode

Menggunakan TypeScript dengan strict: true.

Tipe data MongoDB Mongoose harus diekstrak ke dalam interface TS.

Penamaan fungsi: CamelCase (generateKIMCard).

Penamaan file komponen React: PascalCase (KimGrid.tsx).

3. Version Control

Git Flow: main, develop, feature/*, hotfix/*.

Conventional Commits: feat: add torn card penalty, fix: socket disconnection issue.