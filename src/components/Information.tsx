import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Info,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Search,
  FileText,
  Shield,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { spktApi, type InfoArticle } from '@/lib/spktApi';
import { spktDialogClass } from '@/lib/spktDialog';

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';
const tabsListClass = 'grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 bg-blue-950/60 border border-blue-500/40 p-1';
const tabTriggerClass =
  'text-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md [&_svg]:text-blue-300 data-[state=active]:[&_svg]:text-sky-200';

interface ContactChannel {
  id: string;
  type: string;
  icon: React.ReactNode;
  value: string;
  description: string;
  cardClass: string;
  iconWrap: string;
  detail: string;
  steps: string[];
  actionLabel: string;
  href: string;
}

const contacts: ContactChannel[] = [
  {
    id: 'hotline',
    type: 'Hotline Darurat',
    icon: <Phone className="w-5 h-5" />,
    value: '110',
    description: 'Layanan darurat 24/7',
    cardClass: 'bg-gradient-to-br from-red-900/50 to-blue-900/80 border-red-500/40',
    iconWrap: 'bg-red-500/20 text-red-300',
    detail:
      'Nomor 110 adalah saluran darurat Polri yang beroperasi 24 jam sehari, 7 hari seminggu. Gunakan hanya untuk situasi darurat yang membutuhkan bantuan polisi segera, seperti kejahatan sedang terjadi, kecelakaan berat, atau ancaman terhadap jiwa.',
    steps: [
      'Tekan tombol Hubungi di bawah atau sambungkan ke nomor 110 dari ponsel Anda.',
      'Jelaskan lokasi kejadian dengan jelas dan sebutkan jenis keadaan darurat.',
      'Tetap di tempat aman dan tunggu instruksi petugas jika memungkinkan.',
    ],
    actionLabel: 'Hubungi 110',
    href: 'tel:110',
  },
  {
    id: 'whatsapp',
    type: 'WhatsApp',
    icon: <MessageSquare className="w-5 h-5" />,
    value: '+62 812-3456-7890',
    description: 'Chat dengan petugas',
    cardClass: 'bg-gradient-to-br from-emerald-900/50 to-blue-900/80 border-emerald-500/40',
    iconWrap: 'bg-emerald-500/20 text-emerald-300',
    detail:
      'Layanan WhatsApp SPKT Digital untuk konsultasi non-darurat, tanya jawab persyaratan layanan, dan bantuan penggunaan aplikasi. Petugas akan merespons pada hari kerja.',
    steps: [
      'Klik Buka WhatsApp untuk memulai percakapan.',
      'Sampaikan nama, NIK (jika terkait layanan), dan pertanyaan Anda secara singkat.',
      'Lampirkan screenshot atau nomor laporan jika menanyakan status layanan.',
    ],
    actionLabel: 'Buka WhatsApp',
    href: 'https://wa.me/6281234567890?text=Halo%20SPKT%20Digital%2C%20saya%20ingin%20berkonsultasi.',
  },
  {
    id: 'email',
    type: 'Email',
    icon: <Mail className="w-5 h-5" />,
    value: 'spkt@polri.go.id',
    description: 'Layanan email',
    cardClass: 'bg-gradient-to-br from-blue-800/80 to-blue-900/80 border-blue-500/50',
    iconWrap: 'bg-blue-500/20 text-blue-300',
    detail:
      'Kirim pertanyaan formal, keluhan tertulis, atau permintaan informasi layanan melalui email resmi SPKT. Pastikan subjek email jelas agar petugas dapat menindaklanjuti dengan cepat.',
    steps: [
      'Klik Kirim Email — aplikasi email Anda akan terbuka dengan alamat tujuan terisi.',
      'Tulis subjek, misalnya: "Tanya Status Laporan LP/001/V/2026".',
      'Sertakan data identitas dan nomor referensi layanan jika ada.',
    ],
    actionLabel: 'Kirim Email',
    href: 'mailto:spkt@polri.go.id?subject=Pertanyaan%20Layanan%20SPKT%20Digital',
  },
  {
    id: 'office',
    type: 'Alamat Kantor',
    icon: <MapPin className="w-5 h-5" />,
    value: 'Jl. Sudirman No. 123, Jakarta',
    description: 'Kantor pusat SPKT',
    cardClass: 'bg-gradient-to-br from-purple-900/50 to-blue-900/80 border-purple-500/40',
    iconWrap: 'bg-purple-500/20 text-purple-300',
    detail:
      'Kantor pusat SPKT melayani pengambilan dokumen, konsultasi langsung, dan layanan administratif kepolisian. Kunjungan disarankan pada jam operasional dengan membawa identitas asli.',
    steps: [
      'Klik Lihat Peta untuk membuka petunjuk arah di Google Maps.',
      'Datang pada jam operasional: Senin–Jumat 08:00–16:00, Sabtu 08:00–13:00 WIB.',
      'Bawa KTP asli dan nomor referensi layanan (laporan/surat) jika mengambil dokumen.',
    ],
    actionLabel: 'Lihat Peta',
    href: 'https://www.google.com/maps/search/?api=1&query=Jl.+Sudirman+No.+123+Jakarta',
  },
];

const faqs = [
  {
    question: 'Bagaimana cara melacak status laporan saya?',
    answer: 'Anda dapat melacak status laporan melalui menu "Laporan Saya" dengan memasukkan nomor laporan yang telah diberikan saat pembuatan laporan.'
  },
  {
    question: 'Berapa lama proses pembuatan SKCK?',
    answer: 'Proses pembuatan SKCK memerlukan waktu 3-7 hari kerja setelah semua persyaratan lengkap dan diverifikasi.'
  },
  {
    question: 'Apa yang harus dilakukan jika lupa nomor laporan?',
    answer: 'Anda dapat menghubungi call center kami di 110 atau melihat riwayat laporan di menu "Laporan Saya" jika sudah login.'
  },
  {
    question: 'Apakah bisa membatalkan laporan yang sudah dibuat?',
    answer: 'Laporan yang sudah masuk tidak dapat dibatalkan, namun Anda dapat menghubungi petugas untuk memberikan informasi tambahan atau klarifikasi.'
  },
  {
    question: 'Dokumen apa saja yang diperlukan untuk laporan kehilangan?',
    answer: 'Anda memerlukan KTP asli, surat keterangan RT/RW, dan kronologi kehilangan yang detail.'
  }
];

function formatArticleDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderArticleBody(content: string) {
  return content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="text-sm text-blue-100 leading-relaxed whitespace-pre-line">
        {paragraph}
      </p>
    ));
}

export const Information: React.FC = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [infoArticles, setInfoArticles] = useState<InfoArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<InfoArticle | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactChannel | null>(null);

  useEffect(() => {
    spktApi
      .getInfoArticles()
      .then(({ articles }) => setInfoArticles(articles))
      .catch(() => setInfoArticles([]))
      .finally(() => setArticlesLoading(false));
  }, []);

  const categories = ['all', 'Panduan', 'Layanan', 'Edukasi', 'Peringatan'];

  const filteredArticles = infoArticles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Informasi</h1>
        <p className="text-blue-200 mt-1">Pusat informasi dan bantuan SPKT Digital</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={tabsListClass}>
          <TabsTrigger value="articles" className={`text-xs sm:text-sm py-2 gap-1.5 ${tabTriggerClass}`}>
            <FileText className="w-4 h-4 shrink-0" />
            Artikel & Panduan
          </TabsTrigger>
          <TabsTrigger value="contact" className={`text-xs sm:text-sm py-2 gap-1.5 ${tabTriggerClass}`}>
            <Phone className="w-4 h-4 shrink-0" />
            Kontak
          </TabsTrigger>
          <TabsTrigger value="faq" className={`text-xs sm:text-sm py-2 gap-1.5 ${tabTriggerClass}`}>
            <HelpCircle className="w-4 h-4 shrink-0" />
            FAQ
          </TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    placeholder="Cari artikel atau panduan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400 focus:border-blue-400"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md' : 'border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100'}
                    >
                      {category === 'all' ? 'Semua' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {articlesLoading ? (
            <div className="text-center py-12 text-blue-300">Memuat artikel...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-blue-500/50 bg-gradient-to-br from-blue-800/60 to-blue-700/60 backdrop-blur"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-blue-500/30 text-blue-100 border border-blue-400/50">{article.category}</Badge>
                      <span className="text-xs text-blue-300">
                        {new Date(article.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-white">{article.title}</CardTitle>
                    <CardDescription className="text-blue-200 line-clamp-2">{article.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-300 hover:text-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArticle(article);
                      }}
                    >
                      Baca Selengkapnya <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!articlesLoading && filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <Info className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
              <p className="text-blue-300">Tidak ada artikel ditemukan</p>
            </div>
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Hubungi Kami</CardTitle>
              <CardDescription className="text-blue-200">Berbagai cara untuk menghubungi layanan SPKT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedContact(contact)}
                    className={`${contact.cardClass} border rounded-lg p-6 backdrop-blur text-left w-full transition-all hover:border-blue-300/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${contact.iconWrap}`}>
                        {contact.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 text-white">{contact.type}</h3>
                        <p className="font-bold text-lg mb-1 text-white">{contact.value}</p>
                        <p className="text-sm text-blue-200">{contact.description}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-cyan-300 mt-3">
                          Lihat detail <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Jam Operasional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-800/50 border border-blue-600/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-200" />
                    <span className="font-medium text-white">Senin - Jumat</span>
                  </div>
                  <span className="text-blue-100">08:00 - 16:00 WIB</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-800/50 border border-blue-600/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-200" />
                    <span className="font-medium text-white">Sabtu</span>
                  </div>
                  <span className="text-blue-100">08:00 - 13:00 WIB</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-900/40 border border-red-500/40 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-300" />
                    <span className="font-medium text-white">Hotline Darurat 110</span>
                  </div>
                  <span className="text-red-200 font-bold">24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/50 border-blue-500/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-2">Catatan Penting</h4>
                  <p className="text-sm text-blue-200">
                    Untuk keadaan darurat, segera hubungi 110. Layanan email dan WhatsApp
                    hanya untuk konsultasi non-darurat dan akan direspon dalam 1x24 jam pada hari kerja.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Pertanyaan yang Sering Diajukan</CardTitle>
              <CardDescription className="text-blue-200">Temukan jawaban untuk pertanyaan umum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-blue-500/40 rounded-lg overflow-hidden bg-blue-950/30"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-4 text-left hover:bg-blue-800/50 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <span className="font-medium text-white">{faq.question}</span>
                      </div>
                      <div className={`text-blue-300 transform transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4 pl-12 text-sm text-blue-100 bg-blue-800/50 border-t border-blue-600/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-800/80 to-blue-900/80 border-blue-500/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-blue-300 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-2">Tidak Menemukan Jawaban?</h4>
                  <p className="text-sm text-blue-200 mb-3">
                    Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi kami
                    melalui layanan pengaduan atau hubungi call center kami.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-blue-400/50 text-blue-200 hover:bg-blue-700/50 hover:text-white"
                    onClick={() => setActiveTab('contact')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Hubungi Kami
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Article detail dialog */}
      <Dialog open={selectedArticle != null} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className={spktDialogClass('3xl')}>
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge className="bg-blue-500/30 text-blue-100 border border-blue-400/50">
                    {selectedArticle.category}
                  </Badge>
                  <span className="text-xs text-blue-300">{formatArticleDate(selectedArticle.date)}</span>
                </div>
                <DialogTitle className="text-white text-xl sm:text-2xl pr-6">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription className="text-blue-200 text-base">
                  {selectedArticle.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {renderArticleBody(selectedArticle.content)}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-500/50 text-blue-200 hover:bg-blue-800/50 hover:text-white"
                  onClick={() => setSelectedArticle(null)}
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact detail dialog */}
      <Dialog open={selectedContact != null} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className={spktDialogClass('2xl')}>
          {selectedContact && (
            <>
              <DialogHeader>
                <div className={`inline-flex p-3 rounded-lg w-fit mb-2 ${selectedContact.iconWrap}`}>
                  {selectedContact.icon}
                </div>
                <DialogTitle className="text-white text-xl">{selectedContact.type}</DialogTitle>
                <DialogDescription className="text-blue-100 text-lg font-semibold">
                  {selectedContact.value}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-1">
                <p className="text-sm text-blue-100 leading-relaxed">{selectedContact.detail}</p>

                <div className="rounded-lg border border-blue-500/40 bg-blue-950/40 p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-300" />
                    Langkah selanjutnya
                  </h4>
                  <ol className="space-y-2 pl-5 list-decimal text-sm text-blue-200">
                    {selectedContact.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-500/50 text-blue-200 hover:bg-blue-800/50 hover:text-white w-full sm:w-auto"
                  onClick={() => setSelectedContact(null)}
                >
                  Tutup
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  asChild
                >
                  <a
                    href={selectedContact.href}
                    target={selectedContact.href.startsWith('http') ? '_blank' : undefined}
                    rel={selectedContact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {selectedContact.actionLabel}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
