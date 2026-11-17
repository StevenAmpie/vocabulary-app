import { PrismaClient, WordState } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'technology', name: 'Tecnología', description: 'Dispositivos de uso cotidiano', iconUrl: '💻', displayOrder: 1 },
  { slug: 'office', name: 'Oficina', description: 'Objetos del espacio de trabajo', iconUrl: '🏢', displayOrder: 2 },
  { slug: 'fruits', name: 'Frutas', description: 'Alimentos y sabores cotidianos', iconUrl: '🍎', displayOrder: 3 },
];

const words = [
  ['11111111-1111-4111-8111-111111111111', 'keyboard', 'Keyboard', 'Teclado', '/ˈkiː.bɔːrd/', 'technology', 1, 'Piensa en el dispositivo que utilizas para escribir.', 'Un periférico rectangular con muchas teclas.'],
  ['22222222-2222-4222-8222-222222222222', 'headphones', 'Headphones', 'Auriculares', '/ˈhed.foʊnz/', 'technology', 2, 'Se colocan sobre las orejas para escuchar sonido.', 'Un par de auriculares que cubre ambas orejas.'],
  ['33333333-3333-4333-8333-333333333333', 'screen', 'Screen', 'Pantalla', '/skriːn/', 'technology', 1, 'Es la superficie donde ves aplicaciones e imágenes.', 'Una pantalla rectangular encendida.'],
  ['44444444-4444-4444-8444-444444444444', 'mouse', 'Mouse', 'Ratón', '/maʊs/', 'technology', 1, 'Lo mueves con la mano para controlar el cursor.', 'Un ratón de computadora con rueda central.'],
  ['55555555-5555-4555-8555-555555555555', 'desk', 'Desk', 'Escritorio', '/desk/', 'office', 1, 'Es la superficie sobre la que trabajas.', 'Una mesa de trabajo con espacio para escribir.'],
  ['66666666-6666-4666-8666-666666666666', 'chair', 'Chair', 'Silla', '/tʃer/', 'office', 1, 'Te sientas en ella mientras trabajas.', 'Una silla de oficina con respaldo.'],
  ['77777777-7777-4777-8777-777777777777', 'notebook', 'Notebook', 'Cuaderno', '/ˈnoʊt.bʊk/', 'office', 2, 'Tiene páginas donde puedes tomar notas.', 'Un cuaderno cerrado con cubierta y páginas.'],
  ['88888888-8888-4888-8888-888888888888', 'pen', 'Pen', 'Bolígrafo', '/pen/', 'office', 1, 'Lo usas para escribir con tinta.', 'Un bolígrafo de tinta.'],
  ['99999999-9999-4999-8999-999999999999', 'apple', 'Apple', 'Manzana', '/ˈæp.əl/', 'fruits', 1, 'Es una fruta redonda que puede ser roja o verde.', 'Una manzana roja con una hoja.'],
  ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'banana', 'Banana', 'Banana', '/bəˈnæn.ə/', 'fruits', 1, 'Es amarilla, alargada y se pela.', 'Una banana amarilla curvada.'],
  ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'orange', 'Orange', 'Naranja', '/ˈɔːr.ɪndʒ/', 'fruits', 2, 'Es una fruta cítrica del mismo nombre que su color.', 'Una naranja cítrica con una hoja.'],
  ['cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'grapes', 'Grapes', 'Uvas', '/ɡreɪps/', 'fruits', 2, 'Crecen juntas formando racimos.', 'Un racimo de uvas moradas.'],
] as const;

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, create: category, update: category });
  }

  for (const [id, slug, termEn, translationEs, phoneticIpa, categorySlug, difficultyScore, hint, imageDescription] of words) {
    const data = {
      id,
      slug,
      termEn,
      translationEs,
      phoneticIpa,
      categorySlug,
      difficultyScore,
      hint,
      imageDescription,
      imageUrl: `/media/images/${slug}.svg`,
      audioUrl: `/media/audio/${slug}.mp3`,
    };
    await prisma.word.upsert({ where: { id }, create: data, update: data });
  }

  for (let index = 0; index < words.length; index += 1) {
    const target = words[index];
    const recalled = words[(index + 2) % words.length];
    const sentenceId = `dddddddd-dddd-4ddd-8ddd-${String(index + 1).padStart(12, '0')}`;
    const sentenceEn = `The ${target[2].toLowerCase()} is near the ${recalled[2].toLowerCase()}.`;
    const translationEs = `${target[3]} está cerca de ${recalled[3].toLowerCase()}.`;
    await prisma.sentence.upsert({
      where: { id: sentenceId },
      create: { id: sentenceId, sentenceEn, translationEs },
      update: { sentenceEn, translationEs },
    });
    await prisma.sentenceWord.deleteMany({ where: { sentenceId } });
    await prisma.sentenceWord.createMany({
      data: [
        { sentenceId, wordId: target[0], isTargetWord: true },
        { sentenceId, wordId: recalled[0], isTargetWord: false },
      ],
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@local.test' },
    create: { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', email: 'demo@local.test', displayName: 'Usuario de prueba' },
    update: {},
  });
  for (let index = 0; index < 3; index += 1) {
    const count = index + 1;
    await prisma.userWordProgress.upsert({
      where: { userId_wordId: { userId: demoUser.id, wordId: words[index][0] } },
      create: {
        userId: demoUser.id,
        wordId: words[index][0],
        state: count >= 2 ? WordState.CONSOLIDATING : WordState.DISCOVERED,
        directSuccessCount: count,
      },
      update: {
        state: count >= 2 ? WordState.CONSOLIDATING : WordState.DISCOVERED,
        directSuccessCount: count,
      },
    });
  }
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
