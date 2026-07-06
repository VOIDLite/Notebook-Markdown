import { SlashCommand } from '../types';

export const SLASH_COMMANDS: SlashCommand[] = [
  { key: 'h1', label: 'Header 1', description: '# Judul Utama', insertText: '# ', cursorOffset: 0 },
  { key: 'h2', label: 'Header 2', description: '## Sub Judul', insertText: '## ', cursorOffset: 0 },
  { key: 'h3', label: 'Header 3', description: '### Sub-sub Judul', insertText: '### ', cursorOffset: 0 },
  { key: 'h4', label: 'Header 4', description: '#### Judul Level 4', insertText: '#### ', cursorOffset: 0 },
  { key: 'bold', label: 'Teks Tebal (Bold)', description: '**tebal**', insertText: '****', cursorOffset: 2 },
  { key: 'italic', label: 'Teks Miring (Italic)', description: '*miring*', insertText: '**', cursorOffset: 1 },
  { key: 'strikethrough', label: 'Teks Coret', description: '~~coret~~', insertText: '~~~~', cursorOffset: 2 },
  { key: 'code', label: 'Kode Inline', description: '`kode`', insertText: '``', cursorOffset: 1 },
  { key: 'codeblock', label: 'Blok Kode (Code Block)', description: '```bahasa\nkode\n```', insertText: '\n```\n\n```\n', cursorOffset: 5 },
  { key: 'bullet', label: 'Daftar Bulat (Bullet)', description: '- Item', insertText: '- ', cursorOffset: 0 },
  { key: 'number', label: 'Daftar Angka', description: '1. Item', insertText: '1. ', cursorOffset: 0 },
  { key: 'todo', label: 'Tugas (Checkbox)', description: '- [ ] Tugas', insertText: '- [ ] ', cursorOffset: 0 },
  { key: 'quote', label: 'Kutipan (Quote)', description: '> Kalimat kutipan', insertText: '> ', cursorOffset: 0 },
  { key: 'table', label: 'Tabel (Table)', description: '| Kolom 1 | Kolom 2 |', insertText: '\n| Kolom 1 | Kolom 2 |\n| ------- | ------- |\n| Baris 1 | Baris 2 |\n', cursorOffset: 0 },
  { key: 'hr', label: 'Garis Pembatas', description: '--- (Horizontal Rule)', insertText: '\n---\n', cursorOffset: 0 },
  { key: 'link', label: 'Tautan (Link)', description: '[Nama](Url)', insertText: '[](https://)', cursorOffset: 11 },
  { key: 'image', label: 'Gambar (Image)', description: '![Alt](Url)', insertText: '![](https://)', cursorOffset: 12 },
  { key: 'math', label: 'Matematika LaTeX', description: '$$ Formula $$', insertText: '$$  $$', cursorOffset: 3 },
  { key: 'date', label: 'Tanggal Saat Ini', description: 'Menyisipkan tanggal hari ini', insertText: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), cursorOffset: 0 },
  { key: 'time', label: 'Waktu Saat Ini', description: 'Menyisipkan jam sekarang', insertText: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), cursorOffset: 0 },
  { key: 'details', label: 'Dropdown (Details)', description: '<details> collapsible widget', insertText: '\n<details>\n  <summary>Klik untuk detail</summary>\n  Konten tersembunyi di sini.\n</details>\n', cursorOffset: 0 },
  { key: 'highlight', label: 'Teks Stabilo', description: '<mark>teks</mark>', insertText: '<mark></mark>', cursorOffset: 7 },
  { key: 'lorem', label: 'Lorem Ipsum', description: 'Menyisipkan teks placeholder default', insertText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', cursorOffset: 0 },
];

export const WELCOME_NOTE_TITLE = 'Selamat Datang di Notebook Markdown 📝';

export const WELCOME_NOTE_CONTENT = `# Selamat Datang di Notebook Markdown! 👋

Aplikasi ini adalah catatan berbasis **Markdown** dengan preview real-time dan shortcut slash (\`/\`).

## Fitur Utama ✨
1. **Split Editor**: Geser slider atau tombol di atas untuk beralih mode.
   * **Edit**: Hanya menulis kode Markdown.
   * **Split**: Menulis kode di bawah, preview langsung di atas.
   * **Preview**: Membaca catatan dengan render penuh.
2. **Slash Command Shortcuts**: Ketik \`/\` di editor untuk memunculkan daftar jalan pintas seperti h1, bold, tabel, dll.
3. **Night/Light Mode**: Tema Material 3 yang elegan dan nyaman di mata.

---

## Contoh Penulisan Markdown 🎨

### 1. Gaya Teks
Anda bisa menulis teks dengan format **Tebal (Bold)**, *Miring (Italic)*, ~~Coret (Strikethrough)~~, atau gabungan \`**tebal & miring**\`.

### 2. Daftar (List) & Checkbox
- [x] Selesaikan pembuatan aplikasi
- [ ] Tulis dokumentasi
- [ ] Bagikan ke teman-teman

Daftar Bulat:
* Item pertama
* Item kedua
  * Sub-item

Daftar Angka:
1. Langkah pertama
2. Langkah kedua

### 3. Kutipan (Blockquote)
> "Markdown membuat penulisan format dokumen menjadi sangat cepat dan mudah bagi siapa saja." 
> — John Gruber, Pencipta Markdown

### 4. Blok Kode (Code Block)
\`\`\`typescript
const sapa = (nama: string): string => {
  return \`Halo \${nama}, selamat menulis!\`;
};
console.log(sapa("Developer"));
\`\`\`

### 5. Tabel
| Nama Fitur | Status | Keterangan |
| :--- | :---: | :--- |
| Split Screen |  | Real-time Render |
| Slash Shortcut |  | Sangat Cepat |
| Dark Mode |  | Material 3 Design |

### 6. Gambar & Tautan
Tautan: [Kunjungi website Markdown](https://daringfireball.net/projects/markdown/)

Coba edit teks ini di bawah atau buat catatan baru dengan menekan tombol kembali dan ikon tambah (+) di halaman utama! Selamat mencoba!🚀
`;
