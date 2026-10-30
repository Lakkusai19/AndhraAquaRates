from django.core.management.base import BaseCommand
from apps.pricing.models import PriceRevision

class Command(BaseCommand):
    help = 'Automatically delete price revision history records older than 1 week (7 days).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Age threshold in days for price revision deletion (default: 7 days).'
        )

    def handle(self, *args, **options):
        days = options.get('days', 7)
        self.stdout.write(f"Purging price revisions older than {days} days...")
        deleted_count = PriceRevision.cleanup_expired_revisions(days=days)
        self.stdout.write(
            self.style.SUCCESS(f"Successfully deleted {deleted_count} expired price revision records.")
        )
