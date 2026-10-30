from django.core.management.base import BaseCommand
from apps.locations.models import State, District, MarketLocation

ALL_AP_DISTRICTS_DATA = [
    (
        'Alluri Sitharama Raju',
        [
            ('Paderu Aqua & Feed Supply Center', 'TRADING_CENTER'),
            ('Rampachodavaram Agency Trading Hub', 'TRADING_CENTER'),
            ('Chintapalli Commercial Market', 'MANDI'),
        ]
    ),
    (
        'Anakapalli',
        [
            ('Anakapalli Commercial Mandi & Aqua Hub', 'MANDI'),
            ('Payakaraopeta Coastal Trading Point', 'TRADING_CENTER'),
            ('Atchutapuram Marine Industrial Center', 'PROCESSING_PLANT'),
            ('Nakkapalli Coastal Fish & Shrimp Center', 'HARBOR'),
        ]
    ),
    (
        'Ananthapuramu',
        [
            ('Anantapur Wholesale Fish & Aqua Terminal', 'MANDI'),
            ('Guntakal Junction Aqua Trading Point', 'TRADING_CENTER'),
            ('Tadipatri Commercial Trading Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Annamayya',
        [
            ('Rayachoti Regional Market Yard', 'TRADING_CENTER'),
            ('Madanapalle Aqua & Agri Trading Mandi', 'MANDI'),
            ('Rajampet Commercial Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Bapatla',
        [
            ('Nizampatnam Fishery Harbor', 'HARBOR'),
            ('Bapatla Coastal Trading Point', 'TRADING_CENTER'),
            ('Repalle Aquaculture Market', 'TRADING_CENTER'),
            ('Karlapalem Aquaculture Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Chittoor',
        [
            ('Chittoor Wholesale Market Yard', 'MANDI'),
            ('Palamaner Commercial Trading Hub', 'TRADING_CENTER'),
            ('Kuppam Regional Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Dr. B. R. Ambedkar Konaseema',
        [
            ('Amalapuram Market Center', 'TRADING_CENTER'),
            ('Ravulapalem Trading Terminal', 'MANDI'),
            ('Mummidivaram Aquaculture Center', 'TRADING_CENTER'),
            ('Razole Coastal Market', 'TRADING_CENTER'),
            ('Katrenikona Coastal Landing Point', 'HARBOR'),
        ]
    ),
    (
        'East Godavari',
        [
            ('Rajamahendravaram Aqua Mandi', 'MANDI'),
            ('Kovvur Processing Center', 'PROCESSING_PLANT'),
            ('Nidadavole Cold Chain Gate', 'COLD_STORAGE'),
            ('Anaparthi Aquaculture Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Eluru',
        [
            ('Eluru Wholesale Aquaculture Mandi', 'MANDI'),
            ('Kaikaluru-Eluru Border Aqua Hub', 'TRADING_CENTER'),
            ('Denduluru Cold Storage Hub', 'COLD_STORAGE'),
            ('Jangareddygudem Trading Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Guntur',
        [
            ('Guntur Aqua Trade Terminal', 'MANDI'),
            ('Tenali Commercial Trading Hub', 'TRADING_CENTER'),
            ('Mangalagiri Market Junction', 'TRADING_CENTER'),
            ('Ponnur Aquaculture Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Kakinada',
        [
            ('Kakinada Deepwater Fishing Harbor', 'HARBOR'),
            ('Tallarevu Processing Plant Gate', 'PROCESSING_PLANT'),
            ('Peddapuram Trading Mandi', 'MANDI'),
            ('Uppada Coastal Fishery Point', 'HARBOR'),
        ]
    ),
    (
        'Krishna',
        [
            ('Machilipatnam Coastal Harbor', 'HARBOR'),
            ('Kaikaluru Aqua Center', 'TRADING_CENTER'),
            ('Bantumilli Trading Point', 'TRADING_CENTER'),
            ('Gudivada Commercial Mandi', 'MANDI'),
            ('Nagayalanka Coastal Hub', 'HARBOR'),
        ]
    ),
    (
        'Kurnool',
        [
            ('Kurnool City Wholesale Aqua Terminal', 'MANDI'),
            ('Adoni Commercial Trade Hub', 'TRADING_CENTER'),
            ('Yemmiganur Regional Market', 'TRADING_CENTER'),
        ]
    ),
    (
        'Nandyal',
        [
            ('Nandyal Wholesale Aqua Mandi', 'MANDI'),
            ('Allagadda Trading Center', 'TRADING_CENTER'),
            ('Dhone Commercial Hub', 'TRADING_CENTER'),
        ]
    ),
    (
        'Nellore',
        [
            ('Nellore City Wholesale Aqua Terminal', 'MANDI'),
            ('Kavali Coastal Trading Center', 'TRADING_CENTER'),
            ('Muthukur Krishnapatnam Harbor Gate', 'HARBOR'),
            ('Gudur Marine Hub', 'TRADING_CENTER'),
            ('Vidavaluru Aquaculture Point', 'TRADING_CENTER'),
        ]
    ),
    (
        'NTR (Vijayawada)',
        [
            ('Vijayawada Wholesale Aqua & Fishery Terminal', 'MANDI'),
            ('Ibrahimpatnam Cold Chain & Processing Hub', 'COLD_STORAGE'),
            ('Nandigama Commercial Trade Point', 'TRADING_CENTER'),
            ('Mylavaram Regional Market', 'TRADING_CENTER'),
        ]
    ),
    (
        'Palnadu',
        [
            ('Narasaraopet Regional Aqua Mandi', 'MANDI'),
            ('Piduguralla Commercial Trading Center', 'TRADING_CENTER'),
            ('Chilakaluripet Aqua Highway Hub', 'TRADING_CENTER'),
            ('Sattenapalle Trading Point', 'TRADING_CENTER'),
        ]
    ),
    (
        'Parvathipuram Manyam',
        [
            ('Parvathipuram Regional Trading Hub', 'TRADING_CENTER'),
            ('Salur Commercial Mandi', 'MANDI'),
            ('Palakonda Local Trade Point', 'TRADING_CENTER'),
        ]
    ),
    (
        'Prakasam',
        [
            ('Ongole Commercial Aqua Mandi', 'MANDI'),
            ('Singarayakonda Coast Point', 'TRADING_CENTER'),
            ('Kothapatnam Beach Landing', 'HARBOR'),
            ('Chirala-Vetapalem Aqua Trading Center', 'TRADING_CENTER'),
        ]
    ),
    (
        'Sri Sathya Sai',
        [
            ('Puttaparthi Regional Market Center', 'TRADING_CENTER'),
            ('Kadiri Wholesale Trade Point', 'MANDI'),
            ('Hindupur Commercial Market', 'TRADING_CENTER'),
        ]
    ),
    (
        'Srikakulam',
        [
            ('Bhavanapadu Fishing Harbor', 'HARBOR'),
            ('Srikakulam City Aqua Mandi', 'MANDI'),
            ('Sompeta Coastal Trading Point', 'TRADING_CENTER'),
            ('Kalingapatnam Coastal Hub', 'HARBOR'),
        ]
    ),
    (
        'Tirupati',
        [
            ('Tirupati Wholesale Fishery & Aqua Terminal', 'MANDI'),
            ('Sullurpeta Coastal Aqua Center', 'TRADING_CENTER'),
            ('Tada Pulicat Marine Hub', 'HARBOR'),
            ('Sri Kalahasti Trading Point', 'TRADING_CENTER'),
        ]
    ),
    (
        'Visakhapatnam',
        [
            ('Visakhapatnam Major Fishing Harbor', 'HARBOR'),
            ('Gajuwaka Marine Export Gate', 'PROCESSING_PLANT'),
            ('Bheemunipatnam (Bheemili) Coastal Center', 'HARBOR'),
            ('Duvvada Cold Chain Terminal', 'COLD_STORAGE'),
        ]
    ),
    (
        'Vizianagaram',
        [
            ('Vizianagaram City Aqua Mandi', 'MANDI'),
            ('Bhogapuram Coastal Aquaculture Center', 'TRADING_CENTER'),
            ('Nellimarla Commercial Trading Hub', 'TRADING_CENTER'),
        ]
    ),
    (
        'West Godavari',
        [
            ('Bhimavaram Mandi & Trading Hub', 'MANDI'),
            ('Palakollu Market Junction', 'TRADING_CENTER'),
            ('Narasapuram Harbor Center', 'HARBOR'),
            ('Akividu Aquaculture Terminal', 'TRADING_CENTER'),
            ('Tadepalligudem Cold Storage Hub', 'COLD_STORAGE'),
        ]
    ),
    (
        'YSR Kadapa',
        [
            ('Kadapa Central Fish & Aqua Mandi', 'MANDI'),
            ('Proddatur Commercial Trade Center', 'TRADING_CENTER'),
            ('Pulivendula Regional Market Point', 'TRADING_CENTER'),
        ]
    ),
]

class Command(BaseCommand):
    help = 'Seeds all 26 official districts of Andhra Pradesh with authentic aquaculture markets.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Ensuring all 26 Andhra Pradesh districts and markets exist..."))

        ap_state, _ = State.objects.get_or_create(
            code='AP',
            defaults={'name': 'Andhra Pradesh', 'is_active': True}
        )

        districts_created = 0
        markets_created = 0

        for dist_name, markets in ALL_AP_DISTRICTS_DATA:
            dist, created = District.objects.get_or_create(
                state=ap_state,
                name=dist_name,
                defaults={'is_active': True}
            )
            if created:
                districts_created += 1

            for m_name, l_type in markets:
                _, m_created = MarketLocation.objects.get_or_create(
                    district=dist,
                    name=m_name,
                    defaults={'location_type': l_type, 'is_active': True}
                )
                if m_created:
                    markets_created += 1

        total_districts = District.objects.filter(state=ap_state, is_active=True).count()
        total_markets = MarketLocation.objects.filter(district__state=ap_state, is_active=True).count()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully updated! New districts created: {districts_created}, new markets created: {markets_created}."
        ))
        self.stdout.write(self.style.SUCCESS(
            f"Total active Andhra Pradesh districts: {total_districts} (Expected: 26). Total markets: {total_markets}."
        ))
