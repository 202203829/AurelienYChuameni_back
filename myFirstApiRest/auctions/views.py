from rest_framework import generics, status, permissions, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.db.models import Q

from .models import Category, Auction, Bid
from .serializers import (
    CategoryListCreateSerializer,
    CategoryDetailSerializer,
    AuctionListCreateSerializer,
    AuctionDetailSerializer,
    BidSerializer
)
from .permissions import IsOwnerOrAdmin, IsOwnerOrAdminBid


# ===================== CATEGORÍAS =====================

class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryListCreateSerializer


class CategoryRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryDetailSerializer


# ===================== SUBASTAS =====================

class AuctionListCreate(generics.ListCreateAPIView):
    serializer_class = AuctionListCreateSerializer

    def get_queryset(self):
        queryset = Auction.objects.all()
        params = self.request.query_params

        # Filtro 1: search
        search = params.get('search')
        if search and len(search) < 3:
            raise ValidationError(
                {"search": "Search query must be at least 3 characters long."},
                code=status.HTTP_400_BAD_REQUEST
            )
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        # Filtro 2: rango de precios
        min_price = params.get('min_price')
        max_price = params.get('max_price')

        if min_price:
            if not min_price.isdigit() or int(min_price) <= 0:
                raise ValidationError({"min_price": "Minimum price must be a natural number."})
            queryset = queryset.filter(price__gte=min_price)

        if max_price:
            if not max_price.isdigit() or int(max_price) <= 0:
                raise ValidationError({"max_price": "Maximum price must be a natural number."})
            if min_price and int(max_price) <= int(min_price):
                raise ValidationError({"price_range": "Maximum price must be greater than minimum price."})
            queryset = queryset.filter(price__lte=max_price)

        return queryset

    def perform_create(self, serializer):
        serializer.save(auctioneer=self.request.user)


class AuctionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwnerOrAdmin]
    queryset = Auction.objects.all()
    serializer_class = AuctionDetailSerializer


class UserAuctionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_auctions = Auction.objects.filter(auctioneer=request.user)
        serializer = AuctionListCreateSerializer(user_auctions, many=True)
        return Response(serializer.data)



# ===================== PUJAS =====================

class BidCreateView(generics.CreateAPIView):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        bid = serializer.save(bidder=self.request.user)
        auction = bid.auction

        # Solo actualiza si la puja es mayor al precio actual
        if bid.amount > auction.price:
            auction.price = bid.amount
            auction.save()


class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer

    def get_queryset(self):
        queryset = Bid.objects.all().order_by('-timestamp')
        auction_id = self.request.query_params.get('auction')
        if auction_id:
            queryset = queryset.filter(auction_id=auction_id)
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return []  # público
        elif self.action == 'create':
            return [IsAuthenticatedOrReadOnly()]
        else:
            return [IsOwnerOrAdminBid()]

    def perform_create(self, serializer):
        user = self.request.user
        auction = serializer.validated_data["auction"]
        amount = serializer.validated_data["amount"]

        # Eliminar todas las pujas del usuario en esa subasta menores
        Bid.objects.filter(bidder=user, auction=auction, amount__lt=amount).delete()

        bid = serializer.save(bidder=user)

        # Actualizar el precio de la subasta si esta es la mayor
        if amount > auction.price:
            auction.price = amount
            auction.save()
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)



from rest_framework.decorators import api_view

@api_view(['GET'])
def bids_by_auction(request, auction_id):
    bids = Bid.objects.filter(auction_id=auction_id).order_by('-timestamp')[:5]
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)

# ===================== MIS PUJAS =====================

class MyBidsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_bids = Bid.objects.filter(bidder=request.user).order_by("-timestamp")
        serializer = BidSerializer(user_bids, many=True)
        return Response(serializer.data)


class MyAuctionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_auctions = Auction.objects.filter(auctioneer=request.user)
        serializer = AuctionListCreateSerializer(user_auctions, many=True)
        return Response(serializer.data)
