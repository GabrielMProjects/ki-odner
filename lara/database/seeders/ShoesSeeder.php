<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ShoesSeeder extends Seeder
{
    protected array $shoes = [
        [
            'name'              => 'Nike Air Max 270',
            'sku'               => 'NIKE-AM270-001',
            'price'             => 129.99,
            'special_price'     => 99.99,
            'short_description' => 'Maximaler Komfort mit großer Air-Einheit.',
            'description'       => 'Der Nike Air Max 270 vereint ikonisches Design mit modernstem Komfort. Die riesige Air-Einheit sorgt für überragende Dämpfung bei jedem Schritt. Perfekt für den Alltag und sportliche Aktivitäten.',
            'weight'            => 0.85,
            'image_url'         => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        ],
        [
            'name'              => 'Adidas Ultraboost 23',
            'sku'               => 'ADID-UB23-002',
            'price'             => 179.99,
            'special_price'     => null,
            'short_description' => 'Energie zurück mit jedem Schritt.',
            'description'       => 'Der Adidas Ultraboost 23 bietet revolutionäre Boost-Technologie für maximale Energierückgabe. Das Primeknit-Obermaterial passt sich perfekt deinem Fuß an. Ideal für lange Läufe und den urbanen Alltag.',
            'weight'            => 0.90,
            'image_url'         => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
        ],
        [
            'name'              => 'Converse Chuck Taylor All Star',
            'sku'               => 'CONV-CT-003',
            'price'             => 69.99,
            'special_price'     => 54.99,
            'short_description' => 'Der Klassiker für jeden Anlass.',
            'description'       => 'Der Converse Chuck Taylor All Star ist ein zeitloser Klassiker, der seit Jahrzehnten Generationen begeistert. Hochwertige Leinwand, robuste Gummisohle und das ikonische Sternlogo machen ihn unverwechselbar.',
            'weight'            => 0.70,
            'image_url'         => 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800&q=80',
        ],
        [
            'name'              => 'Puma RS-X Reinvention',
            'sku'               => 'PUMA-RSX-004',
            'price'             => 109.99,
            'special_price'     => 89.99,
            'short_description' => 'Retro-Design trifft moderne Technologie.',
            'description'       => 'Der Puma RS-X Reinvention kombiniert mutiges Retro-Design mit modernster Lauftechnologie. Das RS (Running System) Polstersystem bietet außergewöhnlichen Komfort, während das bullige Profil ein markantes Statement setzt.',
            'weight'            => 0.95,
            'image_url'         => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
        ],
        [
            'name'              => 'New Balance 574',
            'sku'               => 'NB-574-005',
            'price'             => 89.99,
            'special_price'     => null,
            'short_description' => 'Zeitloser Komfort für jeden Tag.',
            'description'       => 'Der New Balance 574 ist ein Streetwear-Klassiker mit ENCAP-Dämpfung für optimalen Halt und Komfort. Das Wildleder-Mesh-Obermaterial kombiniert Langlebigkeit mit einem cleanen, vielseitigen Look.',
            'weight'            => 0.80,
            'image_url'         => 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
        ],
        [
            'name'              => 'Vans Old Skool',
            'sku'               => 'VANS-OS-006',
            'price'             => 74.99,
            'special_price'     => 59.99,
            'short_description' => 'Skateboard-Legende mit ikonischem Sidestripe.',
            'description'       => 'Der Vans Old Skool ist der erste Schuh von Vans mit dem charakteristischen Jazz-Stripe. Ursprünglich für Skater entwickelt, ist er heute ein globales Kultmodell. Langlebiges Wildleder und Canvas-Obermaterial.',
            'weight'            => 0.75,
            'image_url'         => 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
        ],
        [
            'name'              => 'Reebok Classic Leather',
            'sku'               => 'REEB-CL-007',
            'price'             => 84.99,
            'special_price'     => null,
            'short_description' => 'Softes Leder, klassisches Design.',
            'description'       => 'Der Reebok Classic Leather debütierte 1983 als Laufschuh und wurde zur Streetwear-Ikone. Das weiche Vollnarben-Lederobermaterial sorgt für Langlebigkeit, während die leichte EVA-Zwischensohle Dämpfung bietet.',
            'weight'            => 0.78,
            'image_url'         => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
        ],
        [
            'name'              => 'Jordan 1 Retro High OG',
            'sku'               => 'JORD-1HOG-008',
            'price'             => 199.99,
            'special_price'     => null,
            'short_description' => 'Das Original. Die Legende. Neu aufgelegt.',
            'description'       => 'Der Air Jordan 1 Retro High OG ist die Neuauflage des Originals von 1985. Mit hochwertigem Vollleder-Obermaterial, dem sichtbaren Air-Dämpfungssystem und dem ikonischen Wing-Logo ist er ein Muss für jeden Sneaker-Fan.',
            'weight'            => 0.92,
            'image_url'         => 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
        ],
        [
            'name'              => 'Skechers Go Walk 6',
            'sku'               => 'SKET-GW6-009',
            'price'             => 64.99,
            'special_price'     => 49.99,
            'short_description' => 'Schlüpfen rein und wohlfühlen.',
            'description'       => 'Der Skechers Go Walk 6 ist der ultimative Komfortschuh für den ganzen Tag. Das slip-on Design, die ULTRA GO-Dämpfung und das Goga Mat-Fußbett machen jeden Schritt zu einem Erlebnis. Maschinenwaschbar.',
            'weight'            => 0.60,
            'image_url'         => 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
        ],
        [
            'name'              => 'Timberland 6-Inch Premium Boot',
            'sku'               => 'TIMB-6IN-010',
            'price'             => 219.99,
            'special_price'     => 179.99,
            'short_description' => 'Der robuste Klassiker für jedes Wetter.',
            'description'       => 'Der Timberland 6-Inch Premium Boot steht seit 1973 für Qualität, Langlebigkeit und Stil. Wasserdichtes Premium-Nubukleder, isolierte Auskleidung und die robuste Lug-Außensohle machen ihn zum perfekten Allround-Boot.',
            'weight'            => 1.30,
            'image_url'         => 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
        ],
    ];

    public function run(): void
    {
        $this->command->info('Erstelle 10 Schuh-Produkte...');

        // Bildordner erstellen
        if (! is_dir(storage_path('app/public/product'))) {
            mkdir(storage_path('app/public/product'), 0755, true);
        }

        foreach ($this->shoes as $index => $shoe) {
            $this->command->info("  → {$shoe['name']}");

            // Bild herunterladen
            $imagePath = $this->downloadImage($shoe['image_url'], $shoe['sku']);

            // 1. Produkt anlegen
            $productId = DB::table('products')->insertGetId([
                'type'                => 'simple',
                'attribute_family_id' => 1,
                'sku'                 => $shoe['sku'],
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            $urlKey = Str::slug($shoe['name']);

            // 2. Attribute-Werte setzen
            $this->insertAttributeValues($productId, $shoe, $urlKey);

            // 3. Produkt-Flat befüllen
            DB::table('product_flat')->insert([
                'product_id'          => $productId,
                'attribute_family_id' => 1,
                'type'                => 'simple',
                'sku'                 => $shoe['sku'],
                'name'                => $shoe['name'],
                'short_description'   => $shoe['short_description'],
                'description'         => $shoe['description'],
                'url_key'             => $urlKey,
                'price'               => $shoe['price'],
                'special_price'       => $shoe['special_price'],
                'weight'              => $shoe['weight'],
                'status'              => 1,
                'new'                 => 1,
                'featured'            => 1,
                'visible_individually'=> 1,
                'locale'              => 'en',
                'channel'             => 'default',
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            // 4. Inventar setzen (100 Stück)
            DB::table('product_inventories')->insert([
                'product_id'          => $productId,
                'inventory_source_id' => 1,
                'qty'                 => 100,
                'vendor_id'           => 0,
            ]);

            // 5. Bild speichern
            if ($imagePath) {
                DB::table('product_images')->insert([
                    'type'       => 'images',
                    'path'       => $imagePath,
                    'product_id' => $productId,
                    'position'   => 1,
                ]);
            }

            // 6. Kategorie (Root-Kategorie)
            $category = DB::table('categories')->where('id', '>', 1)->first();
            if ($category) {
                DB::table('product_categories')->insert([
                    'product_id'  => $productId,
                    'category_id' => $category->id,
                ]);
            }
        }

        $this->command->info('✅ 10 Schuh-Produkte erfolgreich erstellt!');
    }

    protected function insertAttributeValues(int $productId, array $shoe, string $urlKey): void
    {
        // Attribut-IDs holen
        $attributes = DB::table('attributes')
            ->whereIn('code', ['name', 'description', 'short_description', 'price', 'special_price', 'weight', 'status', 'new', 'featured', 'visible_individually', 'url_key'])
            ->get()
            ->keyBy('code');

        $values = [
            'name'                => ['text_value'    => $shoe['name']],
            'url_key'             => ['text_value'    => $urlKey],
            'short_description'   => ['text_value'    => $shoe['short_description']],
            'description'         => ['text_value'    => $shoe['description']],
            'price'               => ['float_value'   => $shoe['price']],
            'special_price'       => ['float_value'   => $shoe['special_price']],
            'weight'              => ['float_value'   => $shoe['weight']],
            'status'              => ['boolean_value' => 1],
            'new'                 => ['boolean_value' => 1],
            'featured'            => ['boolean_value' => 1],
            'visible_individually'=> ['boolean_value' => 1],
        ];

        foreach ($values as $code => $value) {
            if (! isset($attributes[$code])) {
                continue;
            }

            DB::table('product_attribute_values')->insert(array_merge([
                'product_id'   => $productId,
                'attribute_id' => $attributes[$code]->id,
                'channel'      => null,
                'locale'       => null,
                'text_value'   => null,
                'boolean_value'=> null,
                'integer_value'=> null,
                'float_value'  => null,
                'datetime_value'=> null,
                'date_value'   => null,
                'json_value'   => null,
            ], $value));
        }
    }

    protected function downloadImage(string $url, string $sku): ?string
    {
        try {
            $context = stream_context_create([
                'http' => [
                    'timeout' => 15,
                    'header'  => "User-Agent: Mozilla/5.0\r\n",
                ],
                'ssl' => [
                    'verify_peer'      => false,
                    'verify_peer_name' => false,
                ],
            ]);

            $imageData = @file_get_contents($url, false, $context);

            if (! $imageData) {
                $this->command->warn("  ⚠ Bild konnte nicht geladen werden für {$sku}");
                return null;
            }

            $filename  = 'product/' . Str::slug($sku) . '.jpg';
            $localPath = storage_path('app/public/' . $filename);

            file_put_contents($localPath, $imageData);

            return $filename;
        } catch (\Exception $e) {
            $this->command->warn("  ⚠ Fehler beim Bild-Download: " . $e->getMessage());
            return null;
        }
    }
}
