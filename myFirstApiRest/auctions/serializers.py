from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Category, Auction, Bid, Rating
from drf_spectacular.utils import extend_schema_field


# -------- CATEGORY --------
class CategoryListCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class CategoryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


# -------- AUCTIONS --------
class AuctionListCreateSerializer(serializers.ModelSerializer):
    isOpen = serializers.SerializerMethodField()
    auctioneer = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.CharField(write_only=True)
    category_data = CategoryListCreateSerializer(source='category', read_only=True)

    @extend_schema_field(serializers.BooleanField())
    def get_isOpen(self, obj):
        return obj.closing_date > timezone.now()

    def validate_closing_date(self, value):
        now = timezone.now()
        if value <= now:
            raise serializers.ValidationError("La fecha de cierre debe ser posterior a la actual.")
        if self.instance is None and value - now < timedelta(days=15):
            raise serializers.ValidationError("La subasta debe durar al menos 15 días.")
        return value

    def create(self, validated_data):
        category_name = validated_data.pop("category")
        category_obj, _ = Category.objects.get_or_create(name=category_name)
        validated_data["category"] = category_obj
        return super().create(validated_data)

    class Meta:
        model = Auction
        fields = '__all__'



class AuctionDetailSerializer(serializers.ModelSerializer):
    isOpen = serializers.SerializerMethodField()
    averageRating = serializers.SerializerMethodField()
    auctioneer = serializers.PrimaryKeyRelatedField(read_only=True)
    category = CategoryListCreateSerializer(read_only=True)  # ✅ también aquí

    @extend_schema_field(serializers.BooleanField())
    def get_isOpen(self, obj):
        return obj.closing_date > timezone.now()

    def validate_closing_date(self, value):
        now = timezone.now()
        if value <= now:
            raise serializers.ValidationError("La fecha de cierre debe ser posterior a la actual.")
        if self.instance:
            creation_date = getattr(self.instance, 'created_at', now)
            if value - creation_date < timedelta(days=15):
                raise serializers.ValidationError("La subasta debe durar al menos 15 días desde su creación.")
        return value
    def get_averageRating(self, obj):
        ratings = obj.ratings.all()
        if not ratings:
            return None
        return round(sum(r.score for r in ratings) / len(ratings), 2)


    class Meta:
        model = Auction
        fields = '__all__'


# -------- BIDS --------
class BidSerializer(serializers.ModelSerializer):
    bidder_username = serializers.SerializerMethodField()
    auction_title = serializers.CharField(source='auction.title', read_only=True)
    auction_thumbnail = serializers.CharField(source='auction.thumbnail', read_only=True)
    auction_id = serializers.IntegerField(source='auction.id', read_only=True)

    def get_bidder_username(self, obj):
        return obj.bidder.username

    class Meta:
        model = Bid
        fields = [
            'id', 'amount', 'auction', 'bidder', 'timestamp', 'bidder_username',
            'auction_title', 'auction_thumbnail', 'auction_id'
        ]
        read_only_fields = ['bidder', 'timestamp', 'bidder_username']

class RatingSerializer(serializers.ModelSerializer):
    def validate_score(self, value):
        if value<1 or value>5:
            raise serializers.ValidationError("El rating debe estar entre 1 y 5.")
        return value
    class Meta:
        model = Rating
        fields = ['id', 'user', 'auction', 'rating']
        read_only_fields = ['user']
